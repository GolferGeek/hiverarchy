import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Button,
  Chip,
  Stack,
  Divider
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { supabase } from '../lib/supabase'
import IdeationPanel from '../components/ideation/IdeationPanel'
import ResearchPanel from '../components/research/ResearchPanel'
import { useAI } from '../services/ai'

// Define development steps
const DEVELOPMENT_STEPS = [
  { 
    label: 'Ideation', 
    description: 'Generate and refine ideas',
    component: IdeationPanel 
  },
  { 
    label: 'Research', 
    description: 'Research and gather information',
    component: ResearchPanel
  },
  { 
    label: 'Structure', 
    description: 'Plan post structure and outline',
    component: () => <Typography>Structure Planning coming soon...</Typography>
  },
  { 
    label: 'Content', 
    description: 'Generate and edit content',
    component: () => <Typography>Content Creation coming soon...</Typography>
  },
  { 
    label: 'Refutations', 
    description: 'Address counter-arguments',
    component: () => <Typography>Refutations coming soon...</Typography>
  },
  { 
    label: 'Images', 
    description: 'Generate and manage images',
    component: () => <Typography>Image Generation coming soon...</Typography>
  },
  { 
    label: 'Enhancement', 
    description: 'Enhance and optimize content',
    component: () => <Typography>Content Enhancement coming soon...</Typography>
  },
  { 
    label: 'Review', 
    description: 'Final review and publish',
    component: () => <Typography>Final Review coming soon...</Typography>
  }
]

export default function PostWriter() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setCurrentStep } = useAI()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [developmentId, setDevelopmentId] = useState(null)

  useEffect(() => {
    fetchPost()
  }, [id])

  // Update current step when activeStep changes
  useEffect(() => {
    const stepName = DEVELOPMENT_STEPS[activeStep].label.toLowerCase()
    setCurrentStep(stepName)
  }, [activeStep, setCurrentStep])

  const fetchPost = async () => {
    try {
      setLoading(true)
      
      // Fetch post data with basic fields
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (postError) throw postError

      // Process the post data to ensure we have all needed fields
      const processedPostData = {
        ...postData,
        tag_names: postData.tag_names || [],
        interest_names: postData.interest_names || []
      }

      // Fetch post development data
      const { data: devData, error: devError } = await supabase
        .from('post_developments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (devError) {
        if (devError.code === 'PGRST116') {
          // No existing development data found, will create new record
        } else {
          throw devError
        }
      }

      let finalDevData = devData
      // If no development data exists, create initial record
      if (!devData) {
        const { data: newDev, error: createError } = await supabase
          .from('post_developments')
          .insert([{
            post_id: id,
            status: DEVELOPMENT_STEPS[0].label.toLowerCase(),
            version: 1,
            content: processedPostData.brief_description || '',
            ideas: { ideas: [], relatedTopics: [], audiences: [], childPosts: [], futurePosts: [] }
          }])
          .select()
          .single()

        if (createError) throw createError

        setDevelopmentId(newDev.id)
        finalDevData = newDev
      } else {
        setDevelopmentId(devData.id)
      }

      // Combine post and development data
      const combinedData = {
        ...processedPostData,
        development: finalDevData
      }

      setPost(combinedData)
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updatedData) => {
    if (!developmentId) return

    try {
      setSaving(true)
      
      // If we're in the ideation step, update the post brief description as well
      if (activeStep === 0 && updatedData.content !== undefined && updatedData.content.trim() !== '') {
        const { error: postError } = await supabase
          .from('posts')
          .update({ brief_description: updatedData.content })
          .eq('id', id)

        if (postError) throw postError
      }

      // Update existing development record
      const { error: devError } = await supabase
        .from('post_developments')
        .update({
          status: DEVELOPMENT_STEPS[activeStep].label.toLowerCase(),
          ...updatedData
        })
        .eq('id', developmentId)

      if (devError) throw devError

      // Update local state
      setPost(prev => ({
        ...prev,
        brief_description: activeStep === 0 && updatedData.content !== undefined && updatedData.content.trim() !== '' 
          ? updatedData.content 
          : prev.brief_description,
        development: {
          ...prev.development,
          ...updatedData,
          status: DEVELOPMENT_STEPS[activeStep].label.toLowerCase()
        }
      }))
    } catch (error) {
      // Handle error silently
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    if (activeStep < DEVELOPMENT_STEPS.length - 1) {
      const nextStep = activeStep + 1
      setActiveStep(nextStep)
      await handleSave({ status: DEVELOPMENT_STEPS[nextStep].label.toLowerCase() })
    }
  }

  const handleBack = async () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1
      setActiveStep(prevStep)
      await handleSave({ status: DEVELOPMENT_STEPS[prevStep].label.toLowerCase() })
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const CurrentStepComponent = DEVELOPMENT_STEPS[activeStep].component

  return (
    <Box sx={{ p: 3 }}>
      {/* Post Information Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Brief Description
            </Typography>
            <Typography variant="body1">
              {post?.brief_description || 'No brief description available'}
            </Typography>
          </Box>

          <Divider />

          {/* Tags and Interests side by side */}
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Tags
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {post?.tag_names?.map((tag, index) => (
                  <Chip
                    key={`tag-${index}`}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Interests
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {post?.interest_names?.map((interest, index) => (
                  <Chip
                    key={`interest-${index}`}
                    label={interest}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Development Progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {DEVELOPMENT_STEPS.map((step, index) => (
            <Step key={step.label} completed={index < activeStep}>
              <StepLabel
                optional={<Typography variant="caption">{step.description}</Typography>}
                icon={index < activeStep ? <CheckCircleIcon color="success" /> : undefined}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Current Step Content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <CurrentStepComponent
          data={{
            ...post?.development
          }}
          onUpdate={handleSave}
        />
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<NavigateBeforeIcon />}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={activeStep === DEVELOPMENT_STEPS.length - 1 || saving}
          endIcon={<NavigateNextIcon />}
        >
          {saving ? 'Saving...' : 'Next'}
        </Button>
      </Box>
    </Box>
  )
} 
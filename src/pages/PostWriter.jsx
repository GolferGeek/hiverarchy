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
import ChildPostsPanel from '../components/childposts/ChildPostsPanel'

// Define development steps
const DEVELOPMENT_STEPS = [
  { 
    label: 'Child Posts', 
    description: 'Manage child posts',
    component: ChildPostsPanel 
  },
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

  useEffect(() => {
    fetchPost()
  }, [id])

  // Update current step when activeStep changes
  useEffect(() => {
    const stepName = DEVELOPMENT_STEPS[activeStep].label.toLowerCase()
    setCurrentStep(stepName)
  }, [activeStep, setCurrentStep])

  // Set initial active step based on status
  useEffect(() => {
    if (post?.post_writer?.status) {
      const stepIndex = DEVELOPMENT_STEPS.findIndex(
        step => step.label.toLowerCase() === post.post_writer.status.toLowerCase()
      )
      if (stepIndex !== -1) {
        setActiveStep(stepIndex)
      }
    }
  }, [post?.post_writer?.status])

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

      // Fetch interest descriptions
      const { data: interestData, error: interestError } = await supabase
        .from('interests')
        .select('name, description')
        .in('name', processedPostData.interest_names || [])

      if (interestError) {
        console.error('Error fetching interest descriptions:', interestError)
      }

      // Add interest descriptions to the processed data
      processedPostData.interest_descriptions = interestData?.reduce((acc, interest) => {
        try {
          // If description is already an object, use it directly
          if (typeof interest.description === 'object' && interest.description !== null) {
            acc[interest.name] = interest.description
          } else if (interest.description) {
            // Try to parse as JSON if it's a string
            try {
              acc[interest.name] = JSON.parse(interest.description)
            } catch (parseError) {
              console.log(`Using raw string for interest ${interest.name} - not valid JSON:`, interest.description)
              acc[interest.name] = interest.description
            }
          } else {
            acc[interest.name] = null
          }
        } catch (e) {
          console.error(`Error processing description for interest ${interest.name}:`, e)
          acc[interest.name] = null
        }
        return acc
      }, {}) || {}

      // Initialize post_writer if it doesn't exist
      if (!processedPostData.post_writer) {
        const { data: updatedPost, error: updateError } = await supabase
          .from('posts')
          .update({
            post_writer: {
              status: DEVELOPMENT_STEPS[0].label.toLowerCase(),
              version: 1,
              content: processedPostData.brief_description || '',
              ideas: { ideas: [], relatedTopics: [], audiences: [], childPosts: [], futurePosts: [] },
              research_findings: null,
              refutations: null,
              post_outline: null,
              post_images: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          })
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError
        processedPostData.post_writer = updatedPost.post_writer
      }

      setPost(processedPostData)
    } catch (error) {
      console.error('Error fetching post:', error)
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updatedData) => {
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

      // Update post_writer field
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          post_writer: {
            ...post.post_writer,
            ...updatedData,
            status: DEVELOPMENT_STEPS[activeStep].label.toLowerCase(),
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Update local state
      setPost(prev => ({
        ...prev,
        brief_description: activeStep === 0 && updatedData.content !== undefined && updatedData.content.trim() !== '' 
          ? updatedData.content 
          : prev.brief_description,
        post_writer: {
          ...prev.post_writer,
          ...updatedData,
          status: DEVELOPMENT_STEPS[activeStep].label.toLowerCase(),
          updated_at: new Date().toISOString()
        }
      }))
    } catch (error) {
      console.error('Error saving post:', error)
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
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            ...post?.post_writer,
            brief_description: post?.brief_description,
            tag_names: post?.tag_names,
            interest_names: post?.interest_names,
            interest_ids: post?.interest_ids,
            interest_descriptions: post?.interest_descriptions
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
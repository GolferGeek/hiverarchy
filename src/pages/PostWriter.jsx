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
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { supabase } from '../lib/supabase'
import IdeationPanel from '../components/ideation/IdeationPanel'
import ResearchPanel from '../components/research/ResearchPanel'

// Define development steps
const DEVELOPMENT_STEPS = [
  { 
    label: 'Research', 
    description: 'Research and gather information',
    component: ResearchPanel
  },
  { 
    label: 'Ideation', 
    description: 'Generate and refine ideas',
    component: IdeationPanel 
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
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [developmentId, setDevelopmentId] = useState(null)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      
      // Fetch post data
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (postError) throw postError

      // Fetch post development data
      const { data: devData, error: devError } = await supabase
        .from('post_developments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (devError && devError.code !== 'PGRST116') {
        throw devError
      }

      // If no development data exists, create initial record
      if (!devData) {
        const { data: newDev, error: createError } = await supabase
          .from('post_developments')
          .insert([{
            post_id: id,
            status: DEVELOPMENT_STEPS[0].label.toLowerCase(),
            version: 1
          }])
          .select()
          .single()

        if (createError) throw createError
        
        setDevelopmentId(newDev.id)
        setPost({
          ...postData,
          development: newDev
        })
      } else {
        // Set active step based on development status
        if (devData.status) {
          const stepIndex = DEVELOPMENT_STEPS.findIndex(
            step => step.label.toLowerCase() === devData.status.toLowerCase()
          )
          if (stepIndex !== -1) {
            setActiveStep(stepIndex)
          }
        }

        setDevelopmentId(devData.id)
        setPost({
          ...postData,
          development: devData
        })
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updatedData) => {
    if (!developmentId) {
      console.error('No development ID found')
      return
    }

    try {
      setSaving(true)
      
      // Update existing development record
      const { error: devError } = await supabase
        .from('post_developments')
        .update({
          status: DEVELOPMENT_STEPS[activeStep].label.toLowerCase(),
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', developmentId)

      if (devError) throw devError

      // Update local state
      setPost(prev => ({
        ...prev,
        development: {
          ...prev.development,
          ...updatedData,
          status: DEVELOPMENT_STEPS[activeStep].label.toLowerCase()
        }
      }))
    } catch (error) {
      console.error('Error saving post development:', error)
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
          data={post?.development}
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
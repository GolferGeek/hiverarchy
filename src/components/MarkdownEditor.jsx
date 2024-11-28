import { lazy, Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'

const MDEditor = lazy(() => import('@uiw/react-md-editor'))

export default function MarkdownEditor({ value, onChange }) {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    }>
      <Box sx={{ 
        '& .w-md-editor': { 
          margin: 0,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: 1,
          height: '1000px'
        },
        '& .wmde-markdown': {
          padding: '16px'
        },
        '& .w-md-editor-toolbar': {
          padding: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        },
        '& .w-md-editor-content': {
          height: 'calc(100% - 40px) !important'
        },
        '& .w-md-editor-input': {
          height: '100% !important'
        },
        '& .w-md-editor-text': {
          height: '100% !important'
        },
        '& .w-md-editor-text-input': {
          padding: '16px !important',
          height: '100% !important'
        },
        '& .w-md-editor-preview': {
          padding: '16px !important',
          height: '100% !important'
        }
      }}>
        <MDEditor
          value={value}
          onChange={onChange}
          preview="edit"
          highlightEnable={false}
          enableScroll={true}
        />
      </Box>
    </Suspense>
  )
} 
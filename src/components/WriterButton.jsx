import { Button } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

export default function WriterButton({ postId, ...props }) {
  const navigate = useNavigate()
  const { username } = useParams()

  const handleClick = () => {
    navigate(`/${username}/writer/${postId}`)
  }

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<AutoFixHighIcon />}
      onClick={handleClick}
      {...props}
    >
      AI Writer
    </Button>
  )
} 
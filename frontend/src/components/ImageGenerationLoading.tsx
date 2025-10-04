'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Palette, Sparkles, Image as ImageIcon } from 'lucide-react'

interface ImageGenerationLoadingProps {
  battleConcept: string
  participant1Prompt?: string
  participant2Prompt?: string
  progress?: number
  status?: 'generating' | 'completed' | 'failed'
  error?: string
}

export function ImageGenerationLoading({
  battleConcept,
  participant1Prompt,
  participant2Prompt,
  progress = 0,
  status = 'generating',
  error
}: ImageGenerationLoadingProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'generating':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'generating':
        return 'Generating Images...'
      case 'completed':
        return 'Images Generated!'
      case 'failed':
        return 'Generation Failed'
      default:
        return 'Generating Images...'
    }
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full ${getStatusColor()} flex items-center justify-center animate-pulse`}>
                {status === 'generating' ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : status === 'completed' ? (
                  <Sparkles className="w-8 h-8 text-white" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Palette className="w-4 h-4 text-yellow-900" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              {getStatusText()}
            </h1>
            <p className="text-xl text-muted-foreground">
              Creating AI art from your battle prompts
            </p>
          </div>
        </div>

        {/* Battle Concept Display */}
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Battle Concept</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground font-medium leading-relaxed">
              {battleConcept}
            </p>
          </CardContent>
        </Card>

        {/* Progress Section */}
        {status === 'generating' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Generation Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing prompts and generating images...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participant1Prompt && (
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center">
                      Participant 1 Prompt
                    </Badge>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      {participant1Prompt}
                    </p>
                  </div>
                )}
                
                {participant2Prompt && (
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center">
                      Participant 2 Prompt
                    </Badge>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      {participant2Prompt}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {status === 'failed' && error && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Image generation failed:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {status === 'completed' && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Images Generated Successfully!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your AI art battle images are ready. The battle will continue to the voting phase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge 
            variant={status === 'failed' ? 'destructive' : status === 'completed' ? 'default' : 'secondary'}
            className="text-lg px-6 py-2"
          >
            {status === 'generating' && 'Generating...'}
            {status === 'completed' && 'Completed'}
            {status === 'failed' && 'Failed'}
          </Badge>
        </div>
      </div>
    </div>
  )
}

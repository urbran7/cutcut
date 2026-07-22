import { FC } from 'react'

const BottomTimeline: FC = () => {
  const tracks = [
    { id: 'video2', name: 'Video 2', type: 'video' },
    { id: 'video1', name: 'Video 1', type: 'video' },
    { id: 'audio1', name: 'Audio 1', type: 'audio' },
    { id: 'audio2', name: 'Audio 2', type: 'audio' },
  ]

  return (
    <section className="h-64 bg-app-panel border-t border-app-border flex flex-col">
      {/* Header */}
      <div className="h-10 border-b border-app-border flex items-center px-4">
        <h2 className="text-text-main font-semibold">Timeline</h2>
      </div>
      
      {/* Timeline Content */}
      <div className="flex-1 overflow-hidden">
        {/* Ruler */}
        <div className="h-6 bg-app-secondary border-b border-app-border flex items-center px-2">
          <span className="text-text-secondary text-xs">Ruler</span>
        </div>
        
        {/* Tracks */}
        <div className="overflow-y-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="h-12 border-b border-app-border flex items-center"
            >
              {/* Track Header */}
              <div className="w-24 h-full bg-app-secondary border-r border-app-border flex items-center justify-center px-2">
                <span className="text-text-secondary text-xs truncate">{track.name}</span>
              </div>
              
              {/* Track Content */}
              <div className="flex-1 h-full bg-app-control/30">
                {/* Empty track - no clips */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BottomTimeline

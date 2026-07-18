import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'

export default function GeoLock({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState<boolean | null>(null)
  const [locationName, setLocationName] = useState('')

  useEffect(() => {
    const checkGeo = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()

        const isCalifornia = data.region === 'California' || data.region_code === 'CA'
        const isEU = data.in_eu === true

        if (isCalifornia || isEU) {
          setIsLocked(true)
          setLocationName(data.region || data.country_name || 'Restricted Region')
        } else {
          setIsLocked(false)
        }
      } catch (e) {
        // if the API crashes just let them in, better than locking everyone out
        console.error('GeoLock check failed', e)
        setIsLocked(false)
      }
    }
    checkGeo()
  }, [])

  if (isLocked === null) {
    return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">Loading Security Policies...</div>
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center p-6 selection:bg-red-500/30">
        <div className="max-w-md w-full bg-[#161A1F] border border-red-500/20 rounded-2xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-red-500 tracking-tight">Access Restricted</h1>
          <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-6">Region: {locationName}</div>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">
            Due to strict regulatory compliance and liability requirements, LibreStory is currently unavailable in California and the European Union.
          </p>
          <div className="w-full h-1 bg-red-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

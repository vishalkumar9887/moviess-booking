import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react'
import { nlpAPI, moviesAPI } from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const VoiceAgent = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [conversation, setConversation] = useState([])
  const [speechRecognition, setSpeechRecognition] = useState(null)
  const [currentSlots, setCurrentSlots] = useState({})
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const conversationEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'hi-IN'

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) finalTranscript += t
          else interimTranscript += t
        }

        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript) {
          processVoiceInput(finalTranscript)
          setTranscript('')
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Speech recognition error: ' + event.error)
      }

      recognition.onend = () => setIsListening(false)

      setSpeechRecognition(recognition)
      return () => recognition.stop()
    } else {
      toast.error('Speech recognition not supported')
    }
  }, [])

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const startListening = () => {
    if (speechRecognition && !isListening && !isProcessing) {
      setTranscript('')
      try { speechRecognition.start() } 
      catch (e) { toast.error('Start listening failed') }
    }
  }

  const stopListening = () => {
    if (speechRecognition && isListening) speechRecognition.stop()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  const processVoiceInput = async (text) => {
    setIsProcessing(true)
    try {
      const response = await nlpAPI.parse(text)
      const { intent, slots, response: agentResponse, needsClarification } = response.data

      setConversation(prev => [...prev, { type: 'user', message: text, timestamp: new Date() }])
      setConversation(prev => [...prev, { type: 'agent', message: agentResponse, needsClarification, timestamp: new Date() }])
      setCurrentSlots(prev => ({ ...prev, ...slots }))

      // 🔹 Voice disabled for payment_step
      if (intent !== 'payment_step' && isVoiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(agentResponse)
        utterance.lang = 'hi-IN'
        utterance.volume = 1
        utterance.rate = 1
        utterance.pitch = 1.2
        window.speechSynthesis.speak(utterance)
      }

      if (intent === 'book_ticket' && slots.showtime_id && !needsClarification) {
        handleBookingConfirmation(slots)
      }

    } catch (error) {
      console.error(error)
      toast.error('Request process karte waqt error aaya')
      setConversation(prev => [...prev, { type: 'agent', message: 'Kripaya dobara koshish karein.', timestamp: new Date() }])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBookingConfirmation = async (slots) => {
    try {
      let movieId = slots.movie_id
      if (!movieId) {
        const movies = await moviesAPI.getAll()
        const movie = movies.data.find(m => m.title === slots.movie_name)
        if (movie) movieId = movie.id
        else { toast.error('Movie nahi mili'); return }
      }
      navigate(`/seats/${slots.showtime_id}`, { state: { movieId, numSeats: slots.num_seats || 1, date: slots.date, time: slots.time } })
    } catch (error) { toast.error('Booking process error') }
  }

  const clearConversation = () => { setConversation([]); setCurrentSlots({}); setTranscript('') }

  const toggleVoice = () => { setIsVoiceEnabled(!isVoiceEnabled); if(isVoiceEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel() }

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50">
        <Mic className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Voice Assistant</h3>
              <div className="flex items-center space-x-2">
                <button onClick={toggleVoice} className="px-2 py-1 bg-gray-200 rounded-lg text-sm flex items-center space-x-1">
                  {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span>{isVoiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {conversation.map((msg, i) => (
                <div key={i} className={`p-3 rounded-lg ${msg.type==='user'?'bg-primary-100 text-primary-800 ml-8':'bg-gray-100 text-gray-800 mr-8'}`}>
                  <div className="text-sm font-medium mb-1">{msg.type==='user'?'Aap':'Assistant'}</div>
                  <div>{msg.message}</div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>

            {transcript && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">Sun raha hoon:</div>
                <div className="text-blue-700">{transcript}</div>
              </div>
            )}

            <div className="flex space-x-4">
              <button onClick={isListening ? stopListening : startListening} disabled={isProcessing} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${isListening?'bg-red-500 text-white hover:bg-red-600':'bg-primary-600 text-white hover:bg-primary-700'} ${isProcessing?'opacity-50 cursor-not-allowed':''}`}>
                {isListening ? <><MicOff className="h-4 w-4 inline mr-2"/>Stop</> : <><Mic className="h-4 w-4 inline mr-2"/>Start</>}
              </button>
              <button onClick={clearConversation} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Clear</button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Kuch bol ke try karein:</p>
              <ul className="space-y-1 text-xs">
                <li>• "Avatar ke liye 2 ticket kal 7 baje book karein"</li>
                <li>• "Inception ke showtime dikhaiye"</li>
                <li>• "Dune ke liye ek premium seat book karein"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VoiceAgent

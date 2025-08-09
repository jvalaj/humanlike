import { useState, useEffect } from 'react'

function App() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [typewriterText, setTypewriterText] = useState('')
  const [isTypewriterActive, setIsTypewriterActive] = useState(false)
  const [animatedSentences, setAnimatedSentences] = useState([])
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [currentGridLayout, setCurrentGridLayout] = useState([])
  const [expandedMessages, setExpandedMessages] = useState(new Set())
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsTyping(true)
    
    // Start typewriter effect after a short delay
    setTimeout(() => {
      setIsTyping(false)
      setIsTypewriterActive(true)
      setTypewriterText('')
      setAnimatedSentences([])
      setCurrentSentenceIndex(0)
      setCurrentGridLayout([])
      
      const fullResponse = `This is an example of response. This is another example. Here's a third sentence to demonstrate the effect. And finally, a fourth sentence with different styling. now it is a fifth response. sixth response to text. this is seventh response.`
      
      animatedSentenceEffect(fullResponse)
    }, 1000)
  }

  // Function to generate random grid layouts that sum to 5 per row
  const generateRandomGridLayout = (totalSentences) => {
    const layouts = []
    let remainingSentences = totalSentences
    
    // For mobile devices, use simpler layouts but still varied
    const isMobile = windowWidth <= 768
    
    if (isMobile) {
      // On mobile, create varied but predictable layouts for smooth animation
      while (remainingSentences > 0) {
        if (remainingSentences >= 3) {
          // Prefer layouts with 2-3 items for better mobile display
          const combinations = [
            [1, 1], // 2 boxes
            [1, 1, 1], // 3 boxes
            [1, 2], // mixed
            [2] // 1 wide box
          ]
          const validCombinations = combinations.filter(combo => combo.length <= remainingSentences)
          const randomCombination = validCombinations[Math.floor(Math.random() * validCombinations.length)]
          layouts.push(randomCombination)
          remainingSentences -= randomCombination.length
        } else if (remainingSentences === 2) {
          layouts.push([1, 1])
          remainingSentences -= 2
        } else {
          layouts.push([1])
          remainingSentences -= 1
        }
      }
      return layouts
    }

    while (remainingSentences > 0) {
      // Always create rows that sum to exactly 5
      const combinations = [
        [1, 1, 1, 1, 1], // 5 boxes of width 1
        [1, 1, 1, 2], // 4 boxes: three 1s and one 2
        [1, 1, 3], // 3 boxes: two 1s and one 3
        [1, 2, 2], // 3 boxes: one 1 and two 2s
        [1, 4], // 2 boxes: one 1 and one 4
        [2, 3], // 2 boxes: one 2 and one 3
        [5] // 1 box of width 5
      ]
      
      if (remainingSentences >= 5) {
        // Choose any combination that fits exactly 5 boxes per row
        const validCombinations = combinations.filter(combo => combo.length <= remainingSentences)
        const randomCombination = validCombinations[Math.floor(Math.random() * validCombinations.length)]
        layouts.push(randomCombination)
        remainingSentences -= randomCombination.length
      } else {
        // For remaining sentences less than 5, still try to make a complete row
        // but adjust the last row to fit remaining sentences
        if (remainingSentences === 4) {
          const combinations4 = [[1, 1, 1, 2], [1, 1, 2], [1, 3], [2, 2]]
          const validCombos = combinations4.filter(combo => combo.length <= remainingSentences)
          if (validCombos.length > 0) {
            const randomCombination = validCombos[Math.floor(Math.random() * validCombos.length)]
            layouts.push(randomCombination)
            remainingSentences -= randomCombination.length
          } else {
            layouts.push([1, 1, 1, 1])
            remainingSentences -= 4
          }
        } else if (remainingSentences === 3) {
          const combinations3 = [[1, 1, 3], [1, 2, 2]]
          const randomCombination = combinations3[Math.floor(Math.random() * combinations3.length)]
          layouts.push(randomCombination)
          remainingSentences -= randomCombination.length
        } else if (remainingSentences === 2) {
          layouts.push([2, 3])
          remainingSentences -= 2
        } else if (remainingSentences === 1) {
          layouts.push([5])
          remainingSentences -= 1
        }
      }
    }
    
    return layouts
  }

  const animatedSentenceEffect = (text) => {
    // Split text into sentences
    const sentences = text.split('.').filter(s => s.trim().length > 0).map(s => s.trim() + '.')
    const gridLayout = generateRandomGridLayout(sentences.length)
    
    // Store the grid layout in state for consistent animation
    setCurrentGridLayout(gridLayout)
    
    let sentenceIndex = 0
    const allSentences = []
    
    const showNextSentence = () => {
      if (sentenceIndex < sentences.length) {
        const colors = ['#ff4444', '#4488ff', '#44ff44', '#ff8844', '#8844ff', '#ff4488']
        
        const newSentence = {
          text: sentences[sentenceIndex],
          color: colors[sentenceIndex % colors.length],
          id: Date.now() + sentenceIndex
        }
        
        allSentences.push(newSentence)
        setAnimatedSentences([...allSentences])
        setCurrentSentenceIndex(sentenceIndex)
        sentenceIndex++
        
        // Show next sentence after delay (wait for previous animation to complete)
        setTimeout(showNextSentence, 300)
      } else {
        // Animation complete - wait for the last animation to finish before transitioning
        setTimeout(() => {
          setIsTypewriterActive(false)
          
          // Wait a bit more to ensure animations are complete
          setTimeout(() => {
            // Add the complete message to the messages array with animated sentences
            const aiResponse = {
              id: Date.now(),
              text: text,
              isUser: false,
              timestamp: new Date(),
              animatedSentences: allSentences, // Use the complete array
              gridLayout: gridLayout
            }
            setMessages(prev => [...prev, aiResponse])
            
            // Clean up animation state
            setAnimatedSentences([])
            setCurrentGridLayout([])
            setCurrentSentenceIndex(0)
          }, 50)
        }, 400) // Wait for the last sentence animation to complete (300ms delay + 400ms animation)
      }
    }
    
    showNextSentence()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle input on mobile devices better
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    // Auto-resize textarea on mobile
    if (windowWidth <= 768) {
      e.target.style.height = 'auto'
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
    }
  }

  const chatHistory = [
    'T',
    'N',
  ]

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f7f7f8'
    }}>
      {/* Sidebar */}
     

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#F54927',
        position: 'relative'
      }}>
        {/* Header with Input */}
        <div style={{
          padding: windowWidth <= 768 ? '8px 12px' : '12px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: windowWidth <= 768 ? '8px' : '12px'
          }}>
          
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: windowWidth <= 768 ? '16px' : '16px', // Keep 16px on mobile to prevent zoom
                color: 'white',
                resize: 'none',
                minHeight: '24px',
                maxHeight: '120px',
                padding: windowWidth <= 768 ? '8px 0' : '0',
                lineHeight: '1.4'
              }}
              rows={1}
            />
          </div>
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: messages.length === 0 ? 'center' : 'flex-start'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'white',
              maxWidth: windowWidth <= 768 ? '90%' : '600px',
              padding: windowWidth <= 768 ? '0 16px' : '0'
            }}>
              <h2 style={{
                fontSize: windowWidth <= 768 ? '32px' : windowWidth <= 1024 ? '40px' : '48px',
                marginBottom: '12px',
                fontWeight: '400',
                background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                humanlike
              </h2>
              <p style={{
                fontSize: windowWidth <= 768 ? '16px' : '18px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '20px'
              }}>
                intelligence that looks intelligent
                <br />
               </p>
            </div>
          ) : (
            <div style={{ 
              width: '100%',
              height: '100%'
            }}>
              {messages.map((message, index) => {
                // Check if this is an AI message and there's a user message before it
                const isAIMessage = !message.isUser
                const previousMessage = index > 0 ? messages[index - 1] : null
                const shouldShowWithPrevious = isAIMessage && previousMessage && previousMessage.isUser
                
                // Skip rendering user messages that will be shown with their AI response
                if (message.isUser && index < messages.length - 1 && !messages[index + 1].isUser) {
                  return null
                }
                
                // Skip rendering the most recent user message if animation is active
                // (it will be shown in the live animation section instead)
                if (message.isUser && index === messages.length - 1 && isTypewriterActive) {
                  return null
                }
                
                return (
                  <div
                    key={message.id}
                    style={{
                      width: '100%',
                      maxWidth: windowWidth <= 768 ? '100%' : '800px',
                      margin: '0 auto',
                      padding: windowWidth <= 768 ? '10px 8px' : '20px 12px',
                      boxSizing: 'border-box',
                      gap: windowWidth <= 768 ? '8px' : '12px'
                    }}
                  >
                    {/* Show previous user message if this is an AI response */}
                    {shouldShowWithPrevious && (
                      <div
                        onClick={() => toggleMessageExpansion(previousMessage.id)}
                        style={{
                          width: '100%',
                          maxWidth: '100%',
                          cursor: 'pointer',
                        }}
                      >
                        {expandedMessages.has(previousMessage.id) ? (
                          <div style={{
                            padding: windowWidth <= 768 ? '8px' : '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            lineHeight: '1.6',
                            fontSize: windowWidth <= 768 ? '14px' : '16px',
                            color: 'white'
                          }}>
                            {previousMessage.text}
                          </div>
                        ) : (
                          <div style={{
                            height: '2px',
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '1px',
                            margin: windowWidth <= 768 ? '8px 0' : '12px 0',
                            position: 'relative',
                            overflow: 'hidden'
                          }} />
                        )}
                      </div>
                    )}
                    
                    {message.isUser ? (
                      // Standalone user message (when it's the last message)
                      <div
                        onClick={() => toggleMessageExpansion(message.id)}
                        style={{
                          width: '100%',
                          maxWidth: '100%',
                          cursor: 'pointer',
                        }}
                      >
                        {expandedMessages.has(message.id) ? (
                          <div style={{
                            padding: windowWidth <= 768 ? '8px' : '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            lineHeight: '1.6',
                            fontSize: windowWidth <= 768 ? '14px' : '16px',
                            color: 'white'
                          }}>
                            {message.text}
                          </div>
                        ) : (
                          <div style={{
                            height: '2px',
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '1px',
                            margin: windowWidth <= 768 ? '8px 0' : '12px 0',
                            position: 'relative',
                            overflow: 'hidden'
                          }} />
                        )}
                      </div>
                    ) : (
                      // AI message - display animated sentence grid
                      <div style={{
                        width: '100%',
                        maxWidth: '100%',
                        lineHeight: '1.6',
                        fontSize: windowWidth <= 768 ? '14px' : '16px',
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        padding: windowWidth <= 768 ? '8px' : '12px',
                        borderRadius: '6px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                      {message.animatedSentences && message.gridLayout ? (
                        // Display animated sentences in a grid layout with variable widths
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: windowWidth <= 768 ? '6px' : '8px',
                          width: '100%'
                        }}>
                          {message.gridLayout.map((row, rowIndex) => (
                            <div 
                              key={rowIndex}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: windowWidth <= 768 
                                  ? `repeat(${row.length}, 1fr)` 
                                  : `repeat(${row.length}, 1fr)`,
                                gap: windowWidth <= 768 ? '6px' : '8px',
                                width: '100%'
                              }}
                            >
                              {row.map((width, colIndex) => {
                                // Find the sentence for this position
                                let sentenceIndex = 0
                                for (let r = 0; r < rowIndex; r++) {
                                  sentenceIndex += message.gridLayout[r].length
                                }
                                sentenceIndex += colIndex
                                
                                const sentence = message.animatedSentences[sentenceIndex]
                                if (!sentence) return null
                                
                                return (
                                  <div
                                    key={sentence.id}
                                    className="sentence-box"
                                    style={{
                                      gridColumn: `span ${width}`,
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: windowWidth <= 768 ? '8px 12px' : '12px 16px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                      transform: 'perspective(400px) rotateY(0deg) scale(1) translateY(0px)',
                                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                      fontSize: windowWidth <= 768 ? '12px' : '14px',
                                      textAlign: 'center',
                                      minHeight: windowWidth <= 768 ? '40px' : '50px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backdropFilter: 'blur(10px)',
                                      wordBreak: 'break-word',
                                      opacity: 1
                                    }}
                                  >
                                    {sentence.text}
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Display regular text if animation hasn't started yet
                        <div style={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontStyle: 'italic'
                        }}>
                          {message.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )
              })}
              
              {/* Show live animation for current AI response */}
              {isTypewriterActive && animatedSentences.length > 0 && (
                <div style={{
                  width: '100%',
                  maxWidth: windowWidth <= 768 ? '100%' : '800px',
                  margin: '0 auto',
                  padding: windowWidth <= 768 ? '10px 8px' : '20px 12px',
                  boxSizing: 'border-box',
                  gap: windowWidth <= 768 ? '8px' : '12px'
                }}>
                  {/* Show the most recent user message above the live AI response */}
                  {messages.length > 0 && messages[messages.length - 1].isUser && (
                    <div
                      onClick={() => toggleMessageExpansion(messages[messages.length - 1].id)}
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        cursor: 'pointer',
                      }}
                    >
                      {expandedMessages.has(messages[messages.length - 1].id) ? (
                        <div style={{
                          padding: windowWidth <= 768 ? '8px' : '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          lineHeight: '1.6',
                          fontSize: windowWidth <= 768 ? '14px' : '16px',
                          color: 'white'
                        }}>
                          {messages[messages.length - 1].text}
                        </div>
                      ) : (
                        <div style={{
                          height: '2px',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '1px',
                          margin: windowWidth <= 768 ? '8px 0' : '12px 0',
                          position: 'relative',
                          overflow: 'hidden'
                        }} />
                      )}
                    </div>
                  )}
                  
                  <div style={{
                    width: '100%',
                    maxWidth: '100%',
                    lineHeight: '1.6',
                    fontSize: windowWidth <= 768 ? '14px' : '16px',
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: windowWidth <= 768 ? '8px' : '12px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: windowWidth <= 768 ? '6px' : '8px',
                      width: '100%'
                    }}>
                      {currentGridLayout.map((row, rowIndex) => (
                        <div 
                          key={rowIndex}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: windowWidth <= 768 
                              ? `repeat(${row.length}, 1fr)` 
                              : `repeat(${row.length}, 1fr)`,
                            gap: windowWidth <= 768 ? '6px' : '8px',
                            width: '100%'
                          }}
                        >
                          {row.map((width, colIndex) => {
                            // Find the sentence for this position
                            let sentenceIndex = 0
                            for (let r = 0; r < rowIndex; r++) {
                              sentenceIndex += currentGridLayout[r].length
                            }
                            sentenceIndex += colIndex
                            
                            const sentence = animatedSentences[sentenceIndex]
                            if (!sentence) return (
                              <div
                                key={`empty-${rowIndex}-${colIndex}`}
                                style={{
                                  gridColumn: `span ${width}`,
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: windowWidth <= 768 ? '8px 12px' : '12px 16px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  minHeight: windowWidth <= 768 ? '40px' : '50px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(10px)'
                                }}
                              />
                            )
                            
                            return (
                              <div
                                key={sentence.id}
                                className="sentence-animate"
                                style={{
                                  gridColumn: `span ${width}`,
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: windowWidth <= 768 ? '8px 12px' : '12px 16px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                  transform: 'perspective(400px) rotateY(0deg) scale(1) translateY(0px)',
                                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                  fontSize: windowWidth <= 768 ? '12px' : '14px',
                                  textAlign: 'center',
                                  minHeight: windowWidth <= 768 ? '40px' : '50px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(10px)',
                                  wordBreak: 'break-word',
                                  opacity: 1,
                                  animation: 'slideInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                                }}
                              >
                                {sentence.text}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

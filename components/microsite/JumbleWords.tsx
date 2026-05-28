"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Undo2, Shuffle, Lightbulb, Trophy, ArrowRight, CheckCircle2 } from "lucide-react"

// 50+ Education, College, and General knowledge words
const WORDS = [
  { word: "CAMPUS", hint: "The grounds and buildings of a university or college" },
  { word: "DEGREE", hint: "An academic rank conferred by a college or university" },
  { word: "COLLEGE", hint: "An educational institution or establishment" },
  { word: "STUDENT", hint: "A person who is studying at a school or college" },
  { word: "TEACHER", hint: "A person who helps students to acquire knowledge" },
  { word: "SCIENCE", hint: "The systematic study of the physical and natural world" },
  { word: "PHYSICS", hint: "The branch of science concerned with the nature and properties of matter and energy" },
  { word: "HISTORY", hint: "The study of past events" },
  { word: "BIOLOGY", hint: "The study of living organisms" },
  { word: "LIBRARY", hint: "A building or room containing collections of books" },
  { word: "ALUMNI", hint: "A graduate or former student of a specific school, college, or university" },
  { word: "SCHOLAR", hint: "A specialist in a particular branch of study" },
  { word: "DIPLOMA", hint: "A certificate awarded by an educational establishment" },
  { word: "FACULTY", hint: "The teaching staff of a university or college" },
  { word: "TUITION", hint: "A sum of money charged for teaching or instruction" },
  { word: "EXAMINE", hint: "Inspect (someone or something) in detail" },
  { word: "ACADEMY", hint: "A place of study or training in a special field" },
  { word: "SEMINAR", hint: "A conference or other meeting for discussion or training" },
  { word: "PROJECT", hint: "A collaborative enterprise that is carefully planned" },
  { word: "LECTURE", hint: "An educational talk to an audience" },
  { word: "HOSTEL", hint: "An establishment providing lodging for students" },
  { word: "CAREER", hint: "An occupation undertaken for a significant period" },
  { word: "SUCCESS", hint: "The accomplishment of an aim or purpose" },
  { word: "LEARNING", hint: "The acquisition of knowledge or skills" },
  { word: "SUBJECT", hint: "A branch of knowledge studied or taught" },
  { word: "ENGLISH", hint: "The language of England, widely used" },
  { word: "GRAMMAR", hint: "The whole system and structure of a language" },
  { word: "CHEMISTRY", hint: "The branch of science dealing with substances" },
  { word: "WRITING", hint: "The activity of marking coherent words on paper" },
  { word: "READING", hint: "The action of looking at and comprehending written matter" },
  { word: "LESSON", hint: "An amount of teaching given at one time" },
  { word: "TESTING", hint: "The means by which quality or genuineness is determined" },
  { word: "GRADING", hint: "The action of classifying something according to quality" },
  { word: "RESULTS", hint: "A consequence, effect, or outcome of something" },
  { word: "CHAPTER", hint: "A main division of a book" },
  { word: "CLASSROOM", hint: "A room in a school in which a class is taught" },
  { word: "RESEARCH", hint: "The systematic investigation into materials and sources" },
  { word: "INNOVATE", hint: "Make changes by introducing new methods or ideas" },
  { word: "COMPUTER", hint: "An electronic device for storing and processing data" },
  { word: "SOFTWARE", hint: "The programs used by a computer" },
  { word: "INTERNET", hint: "A global computer network" },
  { word: "WEBSITE", hint: "A set of related web pages located under a single domain name" },
  { word: "NETWORK", hint: "A group or system of interconnected people or things" },
  { word: "ROBOTICS", hint: "The branch of technology dealing with robots" },
  { word: "BUSINESS", hint: "A person's regular occupation, profession, or trade" },
  { word: "FINANCE", hint: "The management of large amounts of money" },
  { word: "ACCOUNT", hint: "A report or description of an event or experience" },
  { word: "MARKET", hint: "A regular gathering of people for the purchase and sale of goods" },
  { word: "MANAGER", hint: "A person responsible for controlling a company" },
  { word: "CREATE", hint: "To make something new" },
  { word: "DEVELOP", hint: "Grow or cause to grow and become more mature" },
  { word: "DESIGN", hint: "A plan or drawing produced to show the look and function" },
  { word: "FUTURE", hint: "The time following the moment of speaking or writing" }
]

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

export default function JumbleWords() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [jumbledLetters, setJumbledLetters] = useState<{ letter: string; id: number }[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isSolved, setIsSolved] = useState(false)
  const [isWrong, setIsWrong] = useState(false)

  // Initialize game
  const initGame = useCallback(() => {
    // Pick a random word that hasn't been played if possible, or just truly random for simplicity
    const randomIndex = Math.floor(Math.random() * WORDS.length)
    setCurrentIndex(randomIndex)
    
    const word = WORDS[randomIndex].word
    const letters = word.split("").map((letter, id) => ({ letter, id }))
    
    // Ensure the jumbled version isn't exactly the correct word
    let shuffled = shuffleArray(letters)
    while (shuffled.map(l => l.letter).join("") === word && word.length > 1) {
      shuffled = shuffleArray(letters)
    }

    setJumbledLetters(shuffled)
    setSelectedIndices([])
    setIsSolved(false)
    setIsWrong(false)
  }, [])

  // Start the first game on mount
  useEffect(() => {
    initGame()
  }, [initGame])

  const currentWordObj = WORDS[currentIndex]
  if (!currentWordObj) return null
  
  const targetWordLength = currentWordObj.word.length

  const handleSelectLetter = (index: number) => {
    if (isSolved || selectedIndices.includes(index)) return
    
    const newSelected = [...selectedIndices, index]
    setSelectedIndices(newSelected)
    setIsWrong(false)

    // Check if word is complete
    if (newSelected.length === targetWordLength) {
      const formedWord = newSelected.map(idx => jumbledLetters[idx].letter).join("")
      if (formedWord === currentWordObj.word) {
        setIsSolved(true)
      } else {
        setIsWrong(true)
      }
    }
  }

  const handleUndo = () => {
    if (isSolved || selectedIndices.length === 0) return
    setSelectedIndices(prev => prev.slice(0, -1))
    setIsWrong(false)
  }

  const handleShuffle = () => {
    if (isSolved) return
    setJumbledLetters(prev => shuffleArray(prev))
    setSelectedIndices([])
    setIsWrong(false)
  }

  const handleNext = () => {
    initGame()
  }

  return (
    <div className="w-full rounded-[2rem] border border-amber-500/20 bg-[#0F172B] overflow-hidden shadow-2xl relative mb-8">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-5">
        
        {/* Header Title */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
            Jumble
          </h3>
          <div className="flex gap-1">
            {["W", "O", "R", "D", "S"].map((l, i) => (
              <div 
                key={i} 
                className="w-6 h-7 sm:w-7 sm:h-8 flex items-center justify-center bg-amber-500 text-[#050818] rounded font-black text-sm sm:text-base shadow-sm"
              >
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Letters (Empty Boxes / Filled) */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {Array.from({ length: targetWordLength }).map((_, i) => {
            const isFilled = i < selectedIndices.length
            const letter = isFilled ? jumbledLetters[selectedIndices[i]].letter : ""
            
            return (
              <div 
                key={i}
                className={`w-9 h-10 sm:w-10 sm:h-11 flex items-center justify-center rounded-lg border-2 text-base sm:text-lg font-black transition-all duration-300
                  ${isFilled 
                    ? isWrong 
                      ? 'bg-red-500/20 border-red-500 text-red-500'
                      : isSolved
                        ? 'bg-green-500/20 border-green-500 text-green-500 scale-105'
                        : 'bg-[#050818] border-amber-500 text-amber-500'
                    : 'bg-[#050818]/50 border-white/10 text-transparent'
                  }
                `}
              >
                {letter}
              </div>
            )
          })}
        </div>

        {/* Available Scrambled Letters */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {jumbledLetters.map((item, idx) => {
            const isSelected = selectedIndices.includes(idx)
            return (
              <button
                key={item.id}
                disabled={isSelected || isSolved}
                onClick={() => handleSelectLetter(idx)}
                className={`w-9 h-10 sm:w-10 sm:h-11 flex items-center justify-center rounded-lg text-base sm:text-lg font-black transition-all duration-300
                  ${isSelected 
                    ? 'bg-[#050818]/20 text-transparent border border-transparent scale-90 opacity-50' 
                    : 'bg-[#050818] text-white border border-white/10 hover:border-amber-500/50 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(245,158,11,0.2)] shadow-md cursor-pointer'
                  }
                `}
              >
                {item.letter}
              </button>
            )
          })}
        </div>

        {/* Hint Box */}
        <div className="bg-[#050818]/60 border border-white/5 rounded-xl p-3 flex items-start sm:items-center justify-center gap-3 mb-5 w-full max-w-sm mx-auto">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-slate-300 text-xs sm:text-sm font-medium text-center leading-snug">
            {currentWordObj.hint}
          </p>
        </div>

        {/* Actions / Success State */}
        <div className="flex justify-center gap-4">
          {isSolved ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-green-500 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Well done!</span>
              </div>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-[#050818] rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
              >
                Next Word
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleUndo}
                disabled={selectedIndices.length === 0}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg font-bold text-sm transition-all
                  bg-[#050818] text-slate-300 border border-white/10 hover:border-white/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo2 size={16} />
                Undo
              </button>
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg font-bold text-sm transition-all
                  bg-[#050818] text-amber-500 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5"
              >
                <Shuffle size={16} />
                Shuffle
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

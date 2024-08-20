import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["player1Score", "player2Score", "player1Name", "player2Name", "saveButton"]
  static values = {
    startTime: Number,
    gameEnded: Boolean
  }

  connect() {
    console.log("Match controller connected")
    this.startTimeValue = Date.now()
    this.gameEndedValue = false
    this.updateSaveButtonState()
  }

  updateScore(event) {
    console.log("updateScore called", event.params)
    if (this.gameEndedValue) return

    const player = event.params.player
    const change = parseInt(event.params.change)
    const scoreTarget = this[`player${player}ScoreTarget`]
    
    let score = parseInt(scoreTarget.textContent) + change
    score = Math.max(0, score)
    scoreTarget.textContent = score
    
    this.checkGameEnd()
  }

  checkGameEnd() {
    const score1 = parseInt(this.player1ScoreTarget.textContent)
    const score2 = parseInt(this.player2ScoreTarget.textContent)
    
    if ((score1 >= 21 || score2 >= 21) && Math.abs(score1 - score2) >= 2) {
      this.gameEndedValue = true
      this.saveButtonTarget.disabled = false
    }
  }

  saveMatch(event) {
    event.preventDefault()
    
    const matchData = {
      player1_name: this.player1NameTarget.value,
      player2_name: this.player2NameTarget.value,
      player1_score: parseInt(this.player1ScoreTarget.textContent),
      player2_score: parseInt(this.player2ScoreTarget.textContent),
      time_played: Math.round((Date.now() - this.startTimeValue) / 1000),
      date: new Date().toISOString().split('T')[0],
      winner: this.player1ScoreTarget.textContent > this.player2ScoreTarget.textContent 
        ? this.player1NameTarget.value 
        : this.player2NameTarget.value
    }

    this.saveMatchToServer(matchData)
  }

  async saveMatchToServer(matchData) {
    try {
      const response = await fetch('/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ match: matchData })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Network response was not ok')
      }
      
      const data = await response.json()
      window.location.href = `/matches/${data.id}`
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save the match. Please try again.')
    }
  }

  updateSaveButtonState() {
    this.saveButtonTarget.disabled = !this.gameEndedValue
  }
}
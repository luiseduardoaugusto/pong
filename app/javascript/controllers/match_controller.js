import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["player1Score", "player2Score", "player1Name", "player2Name", "saveButton", "winnerNotice"]
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
      const winnerName = score1 > score2 ? this.player1NameTarget.value : this.player2NameTarget.value
      this.announceWinner(winnerName)
    }
  }

  announceWinner(winnerName) {
    this.winnerNoticeTarget.textContent = `¡${winnerName} ha ganado el partido! No olvides guardar el resultado.`
    this.winnerNoticeTarget.classList.remove('hidden')
  }

  saveMatch(event) {
    event.preventDefault()
    
    const score1 = parseInt(this.player1ScoreTarget.textContent)
    const score2 = parseInt(this.player2ScoreTarget.textContent)
    const winnerName = score1 > score2 ? this.player1NameTarget.value : this.player2NameTarget.value
    
    const matchData = {
      player1_name: this.player1NameTarget.value,
      player2_name: this.player2NameTarget.value,
      player1_score: score1,
      player2_score: score2,
      time_played: Math.round((Date.now() - this.startTimeValue) / 1000),
      date: new Date().toISOString().split('T')[0],
      winner: winnerName
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
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Unknown error occurred');
        } else {
          const errorText = await response.text();
          console.error('Server responded with non-JSON content:', errorText);
          throw new Error('Server error occurred. Check console for details.');
        }
      }
      
      const data = await response.json()
      window.location.href = `/matches/${data.id}`
    } catch (error) {
      console.error('Error:', error)
      alert(`Failed to save the match: ${error.message}`)
    }
  }

  updateSaveButtonState() {
    this.saveButtonTarget.disabled = !this.gameEndedValue
  }
}
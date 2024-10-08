class MatchesController < ApplicationController
  def index
    @matches = Match.all.order(created_at: :desc)
  end

  def new
    @match = Match.new
  end

  def create
    @match = Match.new(match_params)

    respond_to do |format|
      if @match.save
        format.json { render json: @match, status: :created }
      else
        format.json { render json: { errors: @match.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def show
    @match = Match.find(params[:id])
  end

  private

  def match_params
    params.require(:match).permit(:player1_name, :player2_name, :player1_score, :player2_score, :time_played, :date, :winner)
  end
end
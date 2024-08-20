class CreateMatches < ActiveRecord::Migration[7.0]
  def change
    create_table :matches do |t|
      t.string :player1_name
      t.string :player2_name
      t.integer :player1_score
      t.integer :player2_score
      t.integer :time_played
      t.date :date
      t.string :winner

      t.timestamps
    end
  end
end

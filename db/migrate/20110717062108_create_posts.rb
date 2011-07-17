class CreatePosts < ActiveRecord::Migration
  def self.up
    create_table :posts do |t|
      t.string :title, :null=> false
      t.string :permalink, :null=> false
      t.string :body, :null=> false

      t.timestamps
    end
    
    add_index :posts, :title, :unique => true
    add_index :posts, :permalink, :unique => true
  end

  def self.down
    drop_table :posts
  end
end

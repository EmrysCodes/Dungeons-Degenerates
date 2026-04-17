extends Control


# Called when the node enters the scene tree for the first time.
func _ready():
	pass
func _on_start_button_pressed() -> void:
	get_tree().change_scene_to_file("res://GameScene.tscn")

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	pass

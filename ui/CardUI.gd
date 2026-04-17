extends Button

signal card_selected(card_index)

@onready var card_image = $ContentMargin/CardImage

var card_text: String = ""
var card_index: int = -1
var image_folder: String = ""

func _ready() -> void:
	update_card_image()

	if not pressed.is_connected(_on_pressed):
		pressed.connect(_on_pressed)

func setup(new_text: String, new_index: int, new_image_folder: String) -> void:
	card_text = new_text
	card_index = new_index
	image_folder = new_image_folder
	update_card_image()

func get_card_image_path() -> String:
	if card_index < 0:
		return ""

	var padded_index = str(card_index).pad_zeros(3)
	return image_folder + "/" + padded_index + ".png"

func update_card_image() -> void:
	if not card_image:
		return

	var image_path = get_card_image_path()

	if image_path == "":
		return

	if ResourceLoader.exists(image_path):
		var texture = load(image_path)
		if texture:
			card_image.texture = texture
	else:
		print("Missing card image: ", image_path)

func _on_pressed() -> void:
	card_selected.emit(card_index)

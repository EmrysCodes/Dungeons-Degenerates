extends Control

const CARD_UI_SCENE = preload("res://ui/CardUI.tscn")
const ACTION_CARD_IMAGE_FOLDER = "res://assets/cards/action"
const SCENARIO_CARD_IMAGE_FOLDER = "res://assets/cards/scenario"

var action_card_texts = [
	"I cast fireball and hope for the best.",
	"Seduce the danger.",
	"Hit it with a chair.",
	"Pretend this was my plan all along.",
	"Blame the bard.",
	"Use a cursed item immediately.",
	"Roll under the table and hide.",
	"Challenge it to a drinking contest.",
	"Scream loudly and charge.",
	"Offer it gold that is not mine.",
	"Summon something I cannot control.",
	"Fake my own death.",
	"Throw a smoke bomb and trip in it.",
	"Ask if violence is really necessary, then start violence.",
	"Read the ancient runes out loud with confidence.",
	"Equip something glowing and hope it is friendly.",
	"Kick the door open like I pay rent here.",
	"Convince the problem that I am actually in charge.",
	"Set a trap so bad it becomes genius.",
	"Deploy finger guns and emotional damage.",
	"Drink the potion labeled questionable.",
	"Call for backup that absolutely does not exist.",
	"Hide behind the barbarian.",
	"Start an inspiring speech with no actual plan.",
	"Throw a dagger and a one-liner.",
	"Challenge fate to a fistfight.",
	"Use holy water in a very unholy way.",
	"Declare this a stealth mission way too late.",
	"Accidentally invent a new war crime.",
	"Use the environment irresponsibly.",
	"Offer a side quest instead of solving the problem.",
	"Attempt diplomacy with maximum sarcasm.",
	"Swing first and apologize never.",
	"Try to pickpocket destiny itself.",
	"Light a torch and immediately drop it.",
	"Ask the rogue what could go wrong.",
	"Cast a spell from memory and mostly guess the ending.",
	"Use a disguise that fools no one.",
	"Break line of sight and common sense.",
	"Invoke ancient rights I just made up.",
	"Bribe the monster with snacks.",
	"Insult its mother in three languages.",
	"Hide in a barrel and commit to the bit.",
	"Yell parkour and climb something unstable.",
	"Throw sand in its eyes and confidence in its face.",
	"Offer a handshake and a knife.",
	"Bet the party's money on a terrible idea.",
	"Trigger every trap so none are left.",
	"Use a shield as a sled.",
	"Ask if the boss has a second phase.",
	"Summon legal counsel from another realm.",
	"Start looting before the fight is over.",
	"Declare bankruptcy of the soul.",
	"Cast detect nonsense and find too much.",
	"Use the mimic as cover.",
	"Ask if the dragon respects hustle.",
	"Attempt a backflip for no tactical reason.",
	"Monologue until someone gets uncomfortable.",
	"Confuse the enemy with fake confidence.",
	"Weaponize friendship badly.",
	"Pull the lever and deny responsibility.",
	"Use a battle cry that is mostly swearing.",
	"Threaten it with a strongly worded scroll.",
	"Accuse the wizard of being the problem.",
	"Trip dramatically and call it evasive maneuvering.",
	"Take hostages emotionally.",
	"Turn the map upside down and improvise.",
	"Invoke the ancient law of finders keepers.",
	"Cast knock on something that is not a door.",
	"Use two daggers and zero judgment.",
	"Demand a boss fight refund.",
	"Try to romance the quest giver for better rewards."
]

var scenario_texts = [
	"A dragon blocks the road and demands tribute.",
	"The tavern is on fire, but the bartender is still serving drinks.",
	"You open a treasure chest and hear ticking.",
	"A necromancer asks if you want a job.",
	"The king wants a hero, but you look extremely unqualified.",
	"A goblin tax collector says your coin purse looks suspiciously full.",
	"You accidentally summon a horse in a dungeon corridor.",
	"A cursed mirror starts giving you relationship advice.",
	"The village well is haunted, and somehow that is now your problem.",
	"A wizard offers power, but the contract smells like burnt cheese.",
	"You pull a sword from a stone and immediately regret it.",
	"A gelatinous cube is blocking the only bathroom in the dungeon.",
	"The town guard wants to know why you are covered in feathers.",
	"A ghost demands that you finish its side quest before sunrise.",
	"You find an ancient shrine labeled definitely not trapped.",
	"A cult mistakes you for their prophesied leader.",
	"The innkeeper says your tab has become a regional threat.",
	"A troll will only let you pass if you beat him in poetry.",
	"You awaken an ancient evil by touching the shiny thing.",
	"A bounty hunter claims one of your party members is worth a fortune.",
	"A giant chicken blocks the bridge and demands satisfaction.",
	"The mayor insists this explosion is excellent for tourism.",
	"A mimic has replaced the party's wagon.",
	"You are challenged to honorable combat by someone clearly dishonorable.",
	"A suspiciously muscular elf calls you weak.",
	"A dungeon sign says turn back cowards and now it feels personal.",
	"The cleric has lost the holy relic in a card game.",
	"A vampire invites you in and the vibe is terrible.",
	"You find a map written entirely in insults.",
	"The local blacksmith wants payment in monster teeth."
]

var all_action_cards = []
var all_scenario_cards = []

var action_draw_pile = []
var scenario_draw_pile = []

var player_hand = []
var ai1_hand = []
var ai2_hand = []

var current_scenario = {}
var player_played_card = {}
var ai1_played_card = {}
var ai2_played_card = {}

var player_score = 0
var ai1_score = 0
var ai2_score = 0
var round_number = 1
var is_round_active = false

@onready var round_label = $MainLayout/TopBar/RoundLabel
@onready var restart_button = $MainLayout/TopBar/RestartButton
@onready var exit_button = $MainLayout/TopBar/ExitButton
@onready var scenario_card_image = $MainLayout/ScenarioPanel/ScenarioCardImage
@onready var ai1_score_label = $MainLayout/AIPlayersRow/AI1Panel/AI1Score
@onready var ai2_score_label = $MainLayout/AIPlayersRow/AI2Panel/AI2Score
@onready var player_score_label = $MainLayout/PlayerPanel/PlayerScore
@onready var player_hand_container = $MainLayout/PlayerHand
@onready var player_played_label = $MainLayout/CenterArea/CenterVBox/PlayedCardsRow/PlayerPlayedPanel/PlayerPlayed
@onready var ai1_played_label = $MainLayout/CenterArea/CenterVBox/PlayedCardsRow/AI1PlayedPanel/AI1Played
@onready var ai2_played_label = $MainLayout/CenterArea/CenterVBox/PlayedCardsRow/AI2PlayedPanel/AI2Played
@onready var round_result_label = $MainLayout/CenterArea/CenterVBox/RoundResult

func _ready() -> void:
	randomize()
	build_card_data()
	setup_played_card_slots()

	if not restart_button.pressed.is_connected(_on_restart_button_pressed):
		restart_button.pressed.connect(_on_restart_button_pressed)

	if exit_button and not exit_button.pressed.is_connected(_on_exit_button_pressed):
		exit_button.pressed.connect(_on_exit_button_pressed)

	start_game()

func build_card_data() -> void:
	all_action_cards.clear()
	all_scenario_cards.clear()

	for i in range(action_card_texts.size()):
		all_action_cards.append({
			"text": action_card_texts[i],
			"index": i
		})

	for i in range(scenario_texts.size()):
		all_scenario_cards.append({
			"text": scenario_texts[i],
			"index": i
		})

func setup_played_card_slots() -> void:
	player_played_label.custom_minimum_size = Vector2(220, 90)
	ai1_played_label.custom_minimum_size = Vector2(220, 90)
	ai2_played_label.custom_minimum_size = Vector2(220, 90)

	player_played_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ai1_played_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ai2_played_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER

	player_played_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	ai1_played_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	ai2_played_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER

	player_played_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	ai1_played_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	ai2_played_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART

	round_result_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	round_result_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART

func reset_action_deck() -> void:
	action_draw_pile = all_action_cards.duplicate(true)
	action_draw_pile.shuffle()

func reset_scenario_deck() -> void:
	scenario_draw_pile = all_scenario_cards.duplicate(true)
	scenario_draw_pile.shuffle()

func draw_action_card() -> Dictionary:
	if action_draw_pile.is_empty():
		reset_action_deck()
	return action_draw_pile.pop_back()

func draw_scenario_card() -> Dictionary:
	if scenario_draw_pile.is_empty():
		reset_scenario_deck()
	return scenario_draw_pile.pop_back()

func get_numbered_card_image_path(card_index: int, folder_path: String) -> String:
	if card_index < 0:
		return ""

	var padded_index = str(card_index).pad_zeros(3)
	return folder_path + "/" + padded_index + ".png"

func update_scenario_card_image() -> void:
	if current_scenario.is_empty():
		scenario_card_image.texture = null
		return

	var scenario_index = current_scenario.get("index", -1)
	var image_path = get_numbered_card_image_path(scenario_index, SCENARIO_CARD_IMAGE_FOLDER)

	if image_path != "" and ResourceLoader.exists(image_path):
		var texture = load(image_path)
		if texture:
			scenario_card_image.texture = texture
		else:
			scenario_card_image.texture = null
			print("Failed to load scenario texture: ", image_path)
	else:
		scenario_card_image.texture = null
		print("Missing scenario card image: ", image_path)

func get_played_slot_text(owner_name: String, card_data: Dictionary) -> String:
	if card_data.is_empty():
		return owner_name + "\n\n[ Waiting for play ]"
	return owner_name + "\n\n" + card_data.get("text", "")

func start_game() -> void:
	player_score = 0
	ai1_score = 0
	ai2_score = 0
	round_number = 1
	is_round_active = false

	player_hand.clear()
	ai1_hand.clear()
	ai2_hand.clear()

	current_scenario = {}
	player_played_card = {}
	ai1_played_card = {}
	ai2_played_card = {}

	reset_action_deck()
	reset_scenario_deck()

	draw_hand(player_hand, 7)
	draw_hand(ai1_hand, 7)
	draw_hand(ai2_hand, 7)

	start_round()

func start_round() -> void:
	current_scenario = draw_scenario_card()
	player_played_card = {}
	ai1_played_card = {}
	ai2_played_card = {}
	is_round_active = true

	update_ui()
	refresh_player_hand()

func draw_hand(hand: Array, amount: int) -> void:
	for i in range(amount):
		hand.append(draw_action_card())

func update_ui() -> void:
	round_label.text = "Round %d" % round_number
	update_scenario_card_image()

	player_score_label.text = "Score: %d" % player_score
	ai1_score_label.text = "Score: %d" % ai1_score
	ai2_score_label.text = "Score: %d" % ai2_score

	player_played_label.text = get_played_slot_text("You", player_played_card)
	ai1_played_label.text = get_played_slot_text("AI 1", ai1_played_card)
	ai2_played_label.text = get_played_slot_text("AI 2", ai2_played_card)

	if round_result_label.text == "":
		round_result_label.text = "Choose a card."

func refresh_player_hand() -> void:
	for child in player_hand_container.get_children():
		child.queue_free()

	if not is_round_active:
		return

	for i in range(player_hand.size()):
		var card_data = player_hand[i]
		var card_instance = CARD_UI_SCENE.instantiate()

		card_instance.setup(
			card_data["text"],
			card_data["index"],
			ACTION_CARD_IMAGE_FOLDER
		)

		var card_index = i
		card_instance.card_selected.connect(func(_selected_index): on_player_card_selected(card_index))

		player_hand_container.add_child(card_instance)

func on_player_card_selected(card_index: int) -> void:
	if not is_round_active:
		return

	if card_index < 0 or card_index >= player_hand.size():
		return

	is_round_active = false
	player_played_card = player_hand[card_index]
	player_hand.remove_at(card_index)

	disable_hand_cards()
	ai_take_turns()
	resolve_round()

func disable_hand_cards() -> void:
	for child in player_hand_container.get_children():
		if child is Button:
			child.disabled = true

func ai_take_turns() -> void:
	if ai1_hand.is_empty() or ai2_hand.is_empty():
		return

	var ai1_index = randi() % ai1_hand.size()
	var ai2_index = randi() % ai2_hand.size()

	ai1_played_card = ai1_hand[ai1_index]
	ai2_played_card = ai2_hand[ai2_index]

	ai1_hand.remove_at(ai1_index)
	ai2_hand.remove_at(ai2_index)

func resolve_round() -> void:
	var winner = randi() % 3

	if winner == 0:
		player_score += 1
		round_result_label.text = "You win the round!"
	elif winner == 1:
		ai1_score += 1
		round_result_label.text = "AI 1 wins the round!"
	else:
		ai2_score += 1
		round_result_label.text = "AI 2 wins the round!"

	update_ui()

	if check_victory():
		return

	await get_tree().create_timer(2.0).timeout
	prepare_next_round()

func check_victory() -> bool:
	if player_score >= 5:
		round_result_label.text = "You win the match!"
		update_ui()
		disable_hand_cards()
		return true
	elif ai1_score >= 5:
		round_result_label.text = "AI 1 wins the match!"
		update_ui()
		disable_hand_cards()
		return true
	elif ai2_score >= 5:
		round_result_label.text = "AI 2 wins the match!"
		update_ui()
		disable_hand_cards()
		return true

	return false

func prepare_next_round() -> void:
	draw_hand(player_hand, 1)
	draw_hand(ai1_hand, 1)
	draw_hand(ai2_hand, 1)

	round_number += 1
	round_result_label.text = ""
	start_round()

func _on_restart_button_pressed() -> void:
	start_game()

func _on_exit_button_pressed() -> void:
	get_tree().quit()

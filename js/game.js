/* ========================================
============== Global vars ================
=========================================*/

number_of_cards = 23;
border_colors = ["#3498db", "#27ae60", "#c0392b"]; //cold, neutral, hot
cards = [];
now_playing = -1;
card_id = -1;

/* ========================================
=============== Functions =================
=========================================*/

function generateSlots(n) {
  for (i = 0; i <= n; i++) {
    $('.container').append('<div class="slot" data-slot-id="' + i + '"></div>');
    var card = {
      id: i,
      position: -1,
      card_temp: -1,
      played_by: -1
    };
    cards.push(card);
  }
}

function arraySearch(arr, val) {
  for (var i = 0; i < arr.length; i++)
    if (arr[i] === val)
      return i;
  return false;
}

function generateTemp() {
  return Math.floor(Math.random() * (2 - 0 + 1)) + 0;
}

function changeTurn() {

  if(now_playing == -1){ // first turn, start the game
    now_playing = 1;
  }else{ // switch players
    (now_playing == 1) ? now_playing=2 : now_playing=1;
  }

  card_id++;
  card_temp = generateTemp();

  var card = {
    id: card_id,
    position: -1,
    card_temp: card_temp,
    played_by: now_playing
  };

  cards[card_id] = card;
}

function handle_after_effects() {
  var card = cards[card_id];
  var neighbours = [];
  var neighbour_positions = [card.position - 6, card.position + 6, card.position - 1, card.position + 1];

  //  First loop over each card in the array and select the 4 neighbours if they're present in the grid
  cards.forEach(function(card_index) {
    if(card.played_by == card_index.played_by && neighbour_positions.indexOf(card_index.position) != -1){
      neighbours.push(card_index);
    }
  });

  console.log('Handling card in position '+card.position+". Found "+neighbours.length+" neighbours next to it.");
  //  Next, loop over the neighbours array and check matches
  neighbours.forEach(function(neighbour_index) {

    //  select the slots
    var current_card_slot = $(".container").find("[data-slot-id='" + card.position + "']");
    var selected_neighbour_slot = $(".container").find("[data-slot-id='" + neighbour_index.position + "']");

    //  Option 1:  hot+hot or cold+cold
    if (card.card_temp == 2 && neighbour_index.card_temp == 2 || card.card_temp == 0 && neighbour_index.card_temp == 0) {

      //  clear out the card slots
      current_card_slot.css('background-image', 'none');
      selected_neighbour_slot.css('background-image', 'none');
      current_card_slot.css('outline', 'dotted 1px #444');
      selected_neighbour_slot.css('outline', 'dotted 1px #444');

      //  remove the card slot in the array
      cards[card.id].position = -1;
      cards[card.id].card_temp = -1;
      cards[card.id].played_by = -1;
      cards[neighbour_index.id].position = -1;
      cards[neighbour_index.id].card_temp = -1;
      cards[neighbour_index.id].played_by = -1;

    //  option 2: neutralize
    } else if (card.card_temp == 0 && neighbour_index.card_temp == 2 || card.card_temp == 2 && neighbour_index.card_temp == 0) {

      //  neutralize both cards
      current_card_slot.css('outline', 'solid 2px #AEFFBF');
      selected_neighbour_slot.css('outline', 'solid 2px #AEFFBF');

      //Change the temp values in the array
      cards[card.id].card_temp = 1;
      cards[neighbour_index.id].card_temp = 1;
    }
  });
}

function slot_is_free(pos){
  var status = true;
  cards.forEach(function(card) {
      if(card.position == pos){
        status = false;
      }
  });
  return status;
}

function slot_mouse_enter(){

    var slot_id = $(this).attr('data-slot-id');

    if(slot_is_free(slot_id)){
      
      var card = cards[card_id];
      $(this).css('opacity', '0.5');
      $(this).css('background-image', 'url("./img/'+now_playing+'.png")');
      $(this).css("outline", "solid 2px "+ border_colors[card.card_temp]);
    }
}

function slot_mouse_leave(){

  var slot_id = $(this).attr('data-slot-id');

  if(slot_is_free(slot_id)){

    $(this).css('opacity', '1');
    $(this).css('background-image', 'none');
    $(this).css('outline', 'dotted 1px #444');
  }
}

function slot_click(){

  var slot_id = $(this).attr('data-slot-id');

  if(slot_is_free(slot_id)){

    var card = cards[card_id];

    //Update the current card with the position
    cards[card_id]['position'] = parseInt(slot_id);

    //Place the actual card
    $(this).css('opacity', '1');
    //$(this).css('background-image', 'url("./img/'+now_playing+'.png")');
    //$(this).css("outline", "solid 2px "+ border_colors[card.card_temp]);

    //Check the neighbours and handle burns/freezes
    handle_after_effects();

    //change turn
    changeTurn();
  }
}

/* ========================================
================= Runtime =================
=========================================*/

$(document).ready(function() {
  generateSlots(number_of_cards);
  changeTurn();
});

/* ========================================
================= Events ==================
=========================================*/

$('body').on('mouseenter', '.slot', slot_mouse_enter);
$('body').on('mouseleave', '.slot', slot_mouse_leave);
$('body').on('click', '.slot', slot_click);
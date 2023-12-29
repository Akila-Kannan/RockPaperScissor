// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.41
// 

using Colyseus.Schema;

public class State : Schema {
	[Type(0, "map", "string")]
	public MapSchema<string> players = new MapSchema<string>();

	[Type(1, "string")]
	public string winner = "";

	[Type(2, "boolean")]
	public bool draw = false;

	[Type(3, "string")]
	public string roundWinner = "";

	[Type(4, "string")]
	public string player1Choice = "";

	[Type(5, "string")]
	public string player2Choice = "";

	[Type(6, "boolean")]
	public bool roundDraw = false;

	[Type(7, "number")]
	public float roundCount = 0;
}


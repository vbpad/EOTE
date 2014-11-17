/* --------------------------------------------------------------------------------------------------- */
//                                          Obligation Check Script                                          
//                                                                                                     
// This script will Roll a die to check for obligation within the Star Wars EOTE RPG system.
//        !obligation-check will check all the selected tokens for character sheets then pull the 
//        required information to check for obligation (even if the character has multiple types).    
//        it will then roll a die and sort the characters obligation by value, assign the characters     
//        a bracket and then compare the die roll result to determine if obligation is triggered.    
//        Finally output the results on the chat window.                                                                                    
/* --------------------------------------------------------------------------------------------------- */
 
var ObligDie = 100;                  // Type of die to roll for Oblig
var ObligAttribute1 = "obligationmag1";  // Attribute to compare the roll
var ObligAttribute2 = "obligationmag2";  // Attribute to compare the roll
var ObligAttribute3 = "obligationmag3";  // Attribute to compare the roll
var ObligAttribute4 = "obligationmag4";  // Attribute to compare the roll
state.aChar = state.aChars || {};
var aChars;
 
on("ready", function() 
{
    aChars = new Array();
    state.aChars = aChars;
});
 

 
on('chat:message', function(msg) 
{
    var command = msg.content.toLowerCase();
    if (msg.type == "api" && command == "!obligation-check")
    {
        var selected = msg.selected;
        aChars.length = 0;
//collect selected tokens and assign obligation values from character sheets
        createArray(selected, false);
// check if any tokens are selected
        if(aChars.length>0)
        {
            sendChat("GM", "/desc Obligation");
//roll the dice and compare results
            rollandsort(false);
        }
        else
        {
            sendChat("Script", "/w GM No tokens selected!");
        }    
    }
});
 
function rollandsort(addtokens)
{
    var dieRolled;
    var Triggered = 0;
//Rolling dice
    dieRolled = randomInteger(ObligDie);
    var chatMsg = "/direct Obligation rolled:" + dieRolled + "<br>";
    var obligbrackets = new Array()
// sorts characters by Obligation  
  aChars = aChars.sort(function(a,b)
 { 
              if (a[2] < b[2]) return  1;
                if (a[2] > b[2]) return -1;
                return 0;
            });
//Assign character obligations into brackets
    for (var a = 0; a < aChars.length; a++)
    {
       obligbrackets[a] = new Array()
//pull first characters obligation and display
       if(a>0)
       {
            obligbrackets[a][1] = obligbrackets[(a-1)][2] + 1
            obligbrackets[a][2] = obligbrackets[a][1] + aChars[a][2] -1
       }
//pull the rest of the characters obligations and display
       else
       {
            obligbrackets[a][1] = 0
            obligbrackets[a][2] = aChars[a][2]
       }
//if it hasn't triggered yet check if it will
       if (!Triggered)
       {
            if ((dieRolled >= obligbrackets[a][1]) && (dieRolled <= obligbrackets[a][2]))
            {
                var Trigger = aChars[a][3] + "'s Obligation is triggered";
                Triggered = 1;
            }
            else
            {
                Trigger = "No obligation triggered";
            }
       }
//display the dice roll list of obligations and the trigger if any
       chatMsg += aChars[a][3] + " = " + obligbrackets[a][1] + "-" + obligbrackets[a][2] + "<br>";
    }
    chatMsg += "<br>" + Trigger;
    sendChat("GM", chatMsg);
  state.aChars = aChars;
}
 

 

 
function createArray(ob, newtokens)
{
  var nCount = 0;
  if(newtokens)
  {
    nCount = aChars.length;
  }
//pull the obligation values from all the characters selected
  _.each(ob, function(obj)
  {
        if(obj._type != 'graphic') return;
        var token = getObj("graphic", obj._id);
//check the character sheet linked to the tokens
        var oCharacter = getObj("character", token.get("represents"));
        if (oCharacter != "")
        { 
            aChars[nCount] = new Array(4);
//assign all the characters information for future use
            aChars[nCount][0] = token.get('_id');
            aChars[nCount][3] = token.get('name');
            var oOblig = findObjs({name: ObligAttribute1, _type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
            var oOblig2 = findObjs({name: ObligAttribute2, _type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
            var oOblig3 = findObjs({name: ObligAttribute3, _type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
            var oOblig4 = findObjs({name: ObligAttribute4, _type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
//check if they even have any obligation and how much
            if (oOblig)
            {
                aChars[nCount][1] = "";
                aChars[nCount][2] = parseInt(oOblig.get('current'));
            }
            if (oOblig2)
            {
                aChars[nCount][2] += parseInt(oOblig2.get('current'));
            }
             if (oOblig3)
            {
                aChars[nCount][2] += parseInt(oOblig3.get('current'));
            }
             if (oOblig4)
            {
                aChars[nCount][2] += parseInt(oOblig4.get('current'));
            }
            nCount++;
        }
    });
}

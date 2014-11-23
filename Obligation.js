/* --------------------------------------------------------------------------------------------------- */
//                                          Obligation, Duty, Morality Check Script                                          
//                                                                                                     
// This script will Roll a die to check for obligation, Duty or Morality within the Star Wars EOTE RPG system.
//        !obligation-check
//        !duty-check
//        !morality-check
//        will check all the selected tokens for character sheets then pull the 
//        required information to check for the required check (even if the character has multiple types).    
//        it will then roll a die and sort the characters check by value, assign the characters     
//        a bracket and then compare the die roll result to determine if type is triggered.    
//        Finally output the results on the chat window.                                                                                    
/* --------------------------------------------------------------------------------------------------- */
 
var Die = 100; // Type of die to roll for Oblig
var Mor_die = 10;
var ObligAttribute = "obligationmag";  // Attribute to compare the roll
var DutyAttribute = "dutymag";
var Moralityattribute = "morality";
state.aChar = state.aChars || {};
var aChars;
var type;
 
on("ready", function() 
{
    aChars = new Array();
    state.aChars = aChars;
});
 

 
on('chat:message', function(msg) 
{
    var command = msg.content.toLowerCase();
    /*-------------------------------------------------------------------*/
    //Obligation Check
    if (msg.type == "api" && command == "!obligation-check")
    {
        type = "Obligation";
        var selected = msg.selected;
        aChars.length = 0;
//collect selected tokens and assign obligation values from character sheets
        characterArray(selected, ObligAttribute);
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
    /*-------------------------------------------------------------------*/
    //Duty Check
    if (msg.type == "api" && command == "!duty-check")
    {
        type = "Duty";
        var selected = msg.selected;
        aChars.length = 0;
//collect selected tokens and assign duty values from character sheets
        characterArray(selected, DutyAttribute);
// check if any tokens are selected
        if(aChars.length>0)
        {
            sendChat("GM", "/desc Duty");
//roll the dice and compare results
            rollandsort();
        }
        else
        {
            sendChat("Script", "/w GM No tokens selected!");
        }    
    }
    /*-------------------------------------------------------------------*/
    //Morality Check
    if (msg.type == "api" && command == "!morality-check")
    {
        type = "Morality";
        var selected = msg.selected;
        aChars.length = 0;
//collect selected tokens and assign duty values from character sheets
        characterArray(selected, Moralityattribute);
// check if any tokens are selected
        if(aChars.length>0)
        {
            sendChat("GM", "/desc Morality");
//roll the dice and compare results
            Morrollandcheck();
        }
        else
        {
            sendChat("Script", "/w GM No tokens selected!");
        }    
    }
});
 
function rollandsort()
{
    var dieRolled;
    var Triggered = 0;
//Rolling dice
    dieRolled = randomInteger(Die);
    var chatMsg = "/direct " + type + " rolled:" + dieRolled + "<br>";
    var brackets = new Array()
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
       brackets[a] = new Array()
//pull first characters obligation and display
       if(a>0)
       {
            brackets[a][1] = brackets[(a-1)][2] + 1
            brackets[a][2] = brackets[a][1] + aChars[a][2] -1
       }
//pull the rest of the characters obligations and display
       else
       {
            brackets[a][1] = 0
            brackets[a][2] = aChars[a][2]
       }
//if it hasn't triggered yet check if it will
       if (!Triggered)
       {
            if ((dieRolled >= brackets[a][1]) && (dieRolled <= brackets[a][2]))
            {
                var Trigger = aChars[a][3] + "'s " + type + " is triggered";
                Triggered = 1;
            }
            else
            {
                Trigger = "No " + type + " triggered";
            }
       }
//display the dice roll list of obligations and the trigger if any
       chatMsg += aChars[a][3] + " = " + brackets[a][1] + "-" + brackets[a][2] + "<br>";
    }
    chatMsg += "<br>" + Trigger;
    sendChat("GM", chatMsg);
  state.aChars = aChars;
}
 
function Morrollandcheck()
{
    var dieRolled;
    var Trigger = "";
//Rolling dice
    dieRolled = (_.random(1 , Mor_die) - 1);
    var chatMsg = "/direct " + type + " rolled:" + dieRolled + "<br>";
//display character Moralities
    for (var a = 0; a < aChars.length; a++)
    {
//check if the character's morality triggers
        var rolltest = aChars[a][2] - (~~(aChars[a][2] / 10) * 10); 
        if (dieRolled == rolltest)
        {
            Trigger += aChars[a][3] + "'s " + type + " is triggered" + "<br>";
            var Check = 1;
        }
        else 
        {
            if (!Check)Trigger = "No " + type + " triggered"; 
        }
//display the dice roll, list of Moralities and trigger if any
        if (aChars[a][3])
        {
            chatMsg += aChars[a][3] + " = "  + aChars[a][2] + "<br>";
        }
    }
    chatMsg += "<br>" + Trigger;
    sendChat("GM", chatMsg);
  state.aChars = aChars;
}
 

 
function characterArray(ob, attribute)
{
  var nCount = 0;
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
            aChars[nCount][2] = 0;
//assign all the characters information for future use
            for (var c = 0; c < 5; c++)
            {
                if (attribute != Moralityattribute)
                {
                    var Attributenum = attribute + "" + c;
                }
                else
                {
                    var Attributenum = attribute;
                    aChars[nCount][2] = 0;
                }
                var oAttrib = findObjs({name: Attributenum, _type: "attribute", _characterid: oCharacter.id}, {caseInsensitive: true})[0];
//check if they even have any obligation and how much
                if (oAttrib)
                {
                    aChars[nCount][1] = "";
                    aChars[nCount][2] += parseInt(oAttrib.get('current'));
                    aChars[nCount][0] = token.get('_id');
                    aChars[nCount][3] = token.get('name');
                    var addition = true; 
                }
            }
             if (addition)
             {
                nCount++;
                addition = false;
             }
        }
    });
}

function charIdGenerator()
{
     var charId  ="";
       for (var i = 1; i < 30 ; i++){ 
           charId += String.fromCharCode(97 + Math.random()*10);
       } 
     return charId;    
}

function getRangeByA1Notation(range) {
  
  var namedRanges = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getNamedRanges();
  for(i=0;i<namedRanges.length;i++){
    if(namedRanges[i].getRange().getA1Notation() == range.getA1Notation()){
      return namedRanges[i].getName();
    }
  }
  return null;
}
function myTrigger(evt) {
  var name = getRangeByA1Notation(evt.range);
  if(!name){
      name = charIdGenerator() 
      SpreadsheetApp.getActiveSpreadsheet().setNamedRange(name, SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange())
  }
  var spredsheet = SpreadsheetApp.getActiveSpreadsheet()
  var effectiveUser = Session.getEffectiveUser()
  var editors = spredsheet.getEditors();
  for(var i=0; i < editors.length;i++){
    if(hasValue(evt.oldValue,evt.value)){
      MailApp.sendEmail(editors[i].getEmail(),"Spredsheet \"" + SpreadsheetApp.getActive().getName() +"\" on sheet \""+SpreadsheetApp.getActiveSheet().getName()+"\" edited at \"" + evt.range.getA1Notation()+"\""  + " with name: \"" + name + "\"", "New value:" + evt.value)    
    }
  }
}
function hasValue(old_value,new_value){
  var new_trimmed = new_value.trim()
  if((old_value != new_value) && (new_trimmed != old_value) && (new_value != "" || new_value!= " ")){
    return true
  }
  return false
}
function mailTrigger(){
  var threads = GmailApp.search("to:"+  SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail() + " subject: Re: Spredsheet")
  for(var i=0;i<threads.length;i++){
    if(threads[i].getFirstMessageSubject().split("\"")[1] == SpreadsheetApp.getActive().getName()){
      var messages_in_thread = threads[i].getMessages()
      Logger.log(messages_in_thread)
      if(messages_in_thread.length != 0){
        var last_message = messages_in_thread[messages_in_thread.length - 1]
        var tokens = last_message.getSubject().split("\"")
        var cell_a1_notation = tokens.pop()
        var sheet_name = tokens[3]
        var answer = new RegExp(">([\\w\\s]+)+<", "g").exec(last_message.getBody())[1]
        var note = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(tokens[7]).getNote()
        if(note.lenght == 0){
          note = last_message.getFrom() + ":\n" + answer
        }else{
          note = note + last_message.getFrom() + ":\n\n\n" + answer
        }
        SpreadsheetApp.getActiveSpreadsheet().getRangeByName(tokens[7]).setNote(note);
        last_message.moveToTrash();
      }
    }   
  }
}
function doGet(){
  var t = HtmlService.createTemplateFromFile('index')  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var triggers = ScriptApp.getUserTriggers(ss);
  var filtered = triggers.filter(function (t) {
    t.getEventType() == ScriptApp.EventType.CLOCK && t.getHandlerFunction() == 'mailTrigger'
  })
  if(filtered.length == 0){
      ScriptApp.newTrigger('mailTrigger').timeBased().everyMinutes(1).create();
  }
  return t.evaluate();
}

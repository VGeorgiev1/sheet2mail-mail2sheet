function myTrigger(evt) {
  var spredsheet = SpreadsheetApp.getActiveSpreadsheet()
  var effectiveUser = Session.getEffectiveUser()
  var editors = spredsheet.getEditors();
  for(var i=0; i < editors.length;i++){
    if(hasValue(evt.oldValue,evt.value)){
      MailApp.sendEmail(editors[i].getEmail(),"Spredsheet \"" +SpreadsheetApp.getActive().getName() +"\" on sheet \""+SpreadsheetApp.getActiveSheet().getName()+"\" edited at \"" + evt.range.getA1Notation()+"\"", "New value:" + evt.value)    
    }
  }
  MailApp.sendEmail(effectiveUser.getEmail(),"Spredsheet \"" +SpreadsheetApp.getActive().getName() +"\" on sheet \""+SpreadsheetApp.getActiveSheet().getName()+"\" edited at \"" + evt.range.getA1Notation()+ "\"", "New value:" + evt.value)
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
  Logger.log(threads)
  for(var i=0;i<threads.length;i++){
    if(threads[i].getFirstMessageSubject().split("\"")[1] == SpreadsheetApp.getActive().getName()){
    var messages_in_thread = threads[i].getMessages()
    if(messages_in_thread){
        var last_message = messages_in_thread[messages_in_thread.length - 1]
        var tokens = last_message.getSubject().split("\"")
        var cell_a1_notation = tokens.pop()
        var sheet_name = tokens[3]
        var answer = new RegExp(">([\\w\\s]+)+<", "g").exec(last_message.getBody())[1]
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_name).getRange(cell_a1_notation).setNote(answer);
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
  Logger.log(filtered.length == 0)
  if(filtered.length == 0){
      ScriptApp.newTrigger('mailTrigger').timeBased().everyMinutes(1).create();
  }
  return t.evaluate();
}

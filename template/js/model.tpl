/**
 * <%=pascalCaseName%> Model
 */
module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
 
  const <%=name%>Schema = new Schema({
  })
 
  return mongoose.model('<%=pascalCaseName%>', <%=name%>Schema)
}
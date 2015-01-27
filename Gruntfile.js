module.exports = function(grunt) {
  grunt.registerTask('run', 'task that runs the local server', function() {

  });

  grunt.registerTask('default', 'builds and deploys the project', function() {
    var myTerminal = require("child_process").exec,
    commandToBeExecuted = "sh myCommand.sh";

    myTerminal(commandToBeExecuted, function(error, stdout, stderr) {
      if (!error) {
         //do something
       }
     });
  });
};

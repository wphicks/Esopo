console.log("Hello World!");
angular = require("angular");
AshPaper = require("./AshPaper.js").AshPaper;
var AshPaperApp = angular.module('AshPaperApp', []);
var interpreter = AshPaper.Interpreter();

AshPaperApp.controller('AshPaperController', function($scope) {
    $scope.output = [];
    $scope.evaluate = function() {
        alert("WHOA!");
        /*var program = interpreter.interpret($scope.sourceCode);
        for(var i=0; i < program.instructions.length; i++){
            program.execute_to(i);
            $scope.output.push(
                "Register 0: " + program.registers[0] +
                " Register 1: " + program.registers[1] +
                " Stack: " + program.stack +
                " Output: " + program.output
            );
        }*/
    };
});

AshPaper = require("./AshPaper.js").AshPaper;
var interpreter = AshPaper.Interpreter();

global.runProgram = function() {
    var output = "";
    var program = interpreter.interpret(
        document.getElementById('sourceCode').value);
    for(var i=1; i <= program.instructions.length; i++){
        console.log(program.instructions[i-1]);
        program.execute_to(i);
        output += (
            "Register 0: " + program.registers[0] +
            "    Register 1: " + program.registers[1] +
            "    Stack: " + program.stack._values +
            "    Output: " + program.output + "\n"
        );
    }
    document.getElementById('output').innerHTML = output;
};

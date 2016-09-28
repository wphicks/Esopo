var NLP = require('nlp_compromise');
NLP.plugin(require('nlp-syllables'));

(function(exports) {
    "use strict";
    exports.count_syllables = function(string) {
        var syllables = NLP.term(string).syllables();
        return syllables.map(
                function(word) {return word.length;}).reduce(
                function(prev, cur) {return prev + cur;}, 0);
    };

    exports.choose_register = function(string) {
        if (/^\s/.test(string)){
            return 1;
        }
        return 0;
    };

    exports.Stack = function() {
        if ( !(this instanceof exports.Stack) ) {
            return new exports.Stack();
        }
        this._values = [];
    };
    exports.Stack.prototype = {
        pop:
            function(){
                if (this._values.length === 0) {
                    return 0;
                }
                return this._values.pop();
            },
        push:
            function(new_value){
                this._values.push(new_value);
            },
    };

    exports.Instruction = function(command, syllables, register_index) {
        if ( !(this instanceof exports.Instruction) ) {
            return new exports.Instruction(command, syllables, register_index);
        }
        this.command = command;
        this.syllables = syllables;
        this.register_index = register_index;
    };

    exports.Program = function(raw_instructions) {
        if ( !(this instanceof exports.Program) ) {
            return new exports.Program(raw_instructions);
        }
        this.registers = [0, 0];
        this.stack = new exports.Stack();
        this.instructions = [];
        this.execution_index = 0;
        this.output = "";
        for (var i=0; i < raw_instructions.length; i++){
            this.instructions.push(raw_instructions[i]);
        }
    };
    exports.Program.prototype = {
        execute:
            function(){
                this.execute_to(this.instructions.length);
            },
        execute_to:
            function(line_number){
                this.execution_index = 0;
                while(this.execution_index < line_number &&
                        this.execution_index < this.instructions.length){
                    this.execute_line(this.execution_index);
                    this.execution_index++;
                }
            },
        execute_line:
            function(line_number){
                var instruction = this.instructions[line_number];
                var register_index = instruction.register_index;
                var syllables = instruction.syllables;
                switch(instruction.command){
                    case "GOTOIF":
                        if(
                                this.registers[register_index] >
                                instruction.syllables){
                            this.execution_index = (
                                this.registers[(register_index + 1) % 2] %
                                this.instructions.length
                            );
                            this.execute_line(this.execution_index);
                        }
                        break;
                    case "STORE":
                        this.registers[register_index] = syllables;
                        break;
                    case "NEG":
                        this.registers[register_index] = -1*this.registers[
                            register_index];
                        break;
                    case "MUL":
                        this.registers[register_index] = (
                            this.registers[0]*this.registers[1]);
                        break;
                    case "ADD":
                        this.registers[register_index] = (
                            this.registers[0]+this.registers[1]);
                        break;
                    case "PRINT":
                        this.output += String.fromCharCode(
                                this.registers[register_index]);
                        break;
                    case "PRINTR":
                        this.output += this.registers[register_index];
                        break;
                    case "POP":
                        this.registers[register_index] = this.stack.pop();
                        break;
                    case "PUSH":
                        this.stack.push(this.registers[register_index]);
                        break;
                    case "GOTO":
                        this.execution_index = (
                            this.registers[register_index] %
                            this.instructions.length
                        );
                        this.execute_line(this.execution_index);
                        break;
                    default:
                        break;
                }
            }
    };

    exports.Interpreter = function() {
        if ( !(this instanceof exports.Interpreter) ) {
            return new exports.Interpreter();
        }
    };
    exports.Interpreter.prototype = {
        interpret_line:
            function(line) {
                var syllables = exports.count_syllables(line);
                var register = exports.choose_register(line);
                if (line.search("/") >= 0) {
                    return exports.Instruction("GOTOIF", syllables, register); 
                }
                if (/\b\S+[A-Z]\S+\b/.test(line)) {
                    return exports.Instruction("NEG", syllables, register);
                }
                if (/\b[A-Z][^A-Z]+\b/.test(line)) {
                    return exports.Instruction("MUL", syllables, register);
                }
                if (/\b(like|as)\b/.test(line)) {
                    return exports.Instruction("ADD", syllables, register);
                }
                if (line.search("\\?") >= 0) {
                    return exports.Instruction("PRINT", syllables, register); 
                }
                if (line.search("\\.") >= 0) {
                    return exports.Instruction("PRINTR", syllables, register); 
                }
                if (line.search(",") >= 0) {
                    return exports.Instruction("POP", syllables, register); 
                }
                if (line.search("-") >= 0) {
                    return exports.Instruction("PUSH", syllables, register); 
                }
                var allit_line = line.toLowerCase();
                var word_reg = /\b\w+\b/g;
                var cur_word = word_reg.exec(allit_line);
                var next_word = word_reg.exec(allit_line);
                if (cur_word) {
                    while(next_word) {
                        if (cur_word[0].charAt(0) == next_word[0].charAt(0)) {
                            return exports.Instruction(
                                "GOTO", syllables, register
                            ); 
                        }
                        cur_word = next_word;
                        next_word = word_reg.exec(allit_line);
                    }
                }
                if (syllables === 0){
                    return exports.Instruction("NOOP", syllables, register);
                }
                return exports.Instruction("STORE", syllables, register);
            },
    };
})(this.AshPaper = {});

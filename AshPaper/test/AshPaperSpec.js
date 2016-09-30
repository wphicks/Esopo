var AshPaper = require('../src/AshPaper').AshPaper;
describe("The AshPaper count_syllables function", function(){
    it("counts the syllables in a string", function(){
        expect(
            AshPaper.count_syllables("on either side the river lie")
        ).toEqual(8);
    });
});

describe("The AshPaper choose_register function", function(){
    it("returns 1 if a line begins with whitespace, otherwise 0", function(){
        expect(AshPaper.choose_register("other woodwork")).toBe(0);
        expect(AshPaper.choose_register(" other woodwork")).toEqual(1);
    });
});

describe("The AshPaper Program", function(){
    var program;
    beforeEach(function(){
        program = new AshPaper.Program([]);
    });
    it("is initialized with empty output string", function(){
        expect(program.output).toEqual("");
    });
    it("is initialized with 0 in each register", function(){
        expect(program.registers[0]).toBe(0);
        expect(program.registers[1]).toBe(0);
    });

    it("returns null from an empty stack", function(){
        expect(program.stack.pop()).toBe(null);
    });

    it("executes STORE by storing the number of syllables in the active " +
            "register", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toEqual(3);
    });

    it("executes GOTOIF by jumping to instruction indicated by non-active " +
            "register if number of syllables < active register", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 3, 0),
            AshPaper.Instruction("STORE", 4, 1),
            AshPaper.Instruction("GOTOIF", 2, 0),
            AshPaper.Instruction("STORE", 1, 1),
            AshPaper.Instruction("STORE", 2, 0)
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toEqual(2);
        expect(program.registers[1]).toEqual(4);
        instructions = [
            AshPaper.Instruction("STORE", 3, 0),
            AshPaper.Instruction("STORE", 4, 1),
            AshPaper.Instruction("GOTOIF", 4, 0),
            AshPaper.Instruction("STORE", 1, 0),
            AshPaper.Instruction("STORE", 2, 1)
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toEqual(1);
        expect(program.registers[1]).toEqual(2);
    });

    it("executes NEG by negating the value in the active register", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 3, 0),
            AshPaper.Instruction("NEG", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toEqual(-3);
    });

    it("executes MUL by multiplying registers and storing the result in the " +
            "active register", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 3, 0),
            AshPaper.Instruction("STORE", 2, 1),
            AshPaper.Instruction("MUL", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toEqual(6);
    });
    it("executes ADD by adding registers and storing the result in the " +
            "active register", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 3, 0),
            AshPaper.Instruction("STORE", 2, 1),
            AshPaper.Instruction("ADD", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toEqual(5);
    });
    it("executes PRINT by adding the ASCII character indicated by the active " +
            "register to the output string", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 65, 0),
            AshPaper.Instruction("PRINT", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.output).toEqual("A");
    });
    it("executes PRINT by adding the ASCII character indicated by the active " +
            "register to the output string", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 65, 0),
            AshPaper.Instruction("PRINTR", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.output).toEqual("65");
    });
    it("executes POP by popping the stack to the active " +
            "register", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 65, 0),
            AshPaper.Instruction("POP", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toEqual(65);
    });
    it("executes PUSH by pushing the active register to the stack", function(){
        var instructions = [
            AshPaper.Instruction("STORE", 65, 0),
            AshPaper.Instruction("PUSH", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.stack.pop()).toEqual(65);
    });
    it("executes GOTO by jumping to instruction indicated by active register",
            function(){
        var instructions = [
            AshPaper.Instruction("STORE", 3, 0),
            AshPaper.Instruction("GOTO", 2, 0),
            AshPaper.Instruction("STORE", 1, 1),
            AshPaper.Instruction("STORE", 2, 0)
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toEqual(2);
        expect(program.registers[1]).toBe(0);
    });
    it("executes NOOP by doing nothing", function(){
        var instructions = [
            AshPaper.Instruction("NOOP", 3, 0),
        ];
        program = new AshPaper.Program(instructions);
        program.execute();
        expect(program.registers[0]).toBe(0);
        expect(program.registers[1]).toBe(0);
        expect(program.stack.pop()).toBe(null);
    });
});

describe("The AshPaper Interpreter", function(){
    var interpreter;
    beforeEach(function(){
        interpreter = new AshPaper.Interpreter();
    });

    it("interprets a '/' as a GOTOIF command", function(){
        expect(interpreter.interpret_line("/ AshPaper").command).toEqual("GOTOIF");
    });
    it("interprets a capital within a word as a NEG command", function(){
        expect(interpreter.interpret_line("AshPaper").command).toEqual("NEG");
    });
    it("interprets a capital beginning a word as a MUL command", function(){
        expect(interpreter.interpret_line("as Ashpaper").command).toEqual("MUL");
    });
    it("interprets like or as in a line as an ADD command", function(){
        expect(interpreter.interpret_line("like an armadillo?").command).toEqual("ADD");
        expect(interpreter.interpret_line("as the armadillo?").command).toEqual("ADD");
    });
    it("interprets '?' in a line as a PRINT command", function(){
        expect(interpreter.interpret_line("...why?").command).toEqual("PRINT");
    });
    it("interprets '.' in a line as a PRINTR command", function(){
        expect(interpreter.interpret_line("hey, why...").command).toEqual("PRINTR");
    });
    it("interprets ',' in a line as a POP command", function(){
        expect(interpreter.interpret_line("hey, why-").command).toEqual("POP");
    });
    it("interprets '-' in a line as a PUSH command", function(){
        expect(interpreter.interpret_line("wait why-").command).toEqual("PUSH");
    });
    it("interprets alliteration as a GOTO command", function(){
        expect(interpreter.interpret_line("wait why").command).toEqual("GOTO");
    });
    it("interprets blank lines as a NOOP command", function(){
        expect(interpreter.interpret_line("").command).toEqual("NOOP");
    });
    it("interprets anything else as a STORE command", function(){
        expect(interpreter.interpret_line("other woodwork").command).toEqual("STORE");
    });
});

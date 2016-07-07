#!/usr/bin/env python
import sys
import re
from nltk.corpus import cmudict

PRON_DICT = cmudict.dict()
NUM_RE = re.compile(r"[0-9]")
INT_CAP_RE = re.compile(r"\b\S+[A-Z]\S+\b")
CAP_RE = re.compile(r"\b[A-Z][^A-Z]+\b")
SIMILE_RE = re.compile(r"\b(like|as)\b")
START_WS_RE = re.compile(r"^\s")


def count_syllables(word):
    word = word.lower()
    try:
        all_prons = PRON_DICT[word]
        return max(
            [len([phon for phon in pron if phon[-1].isdigit()])
                for pron in all_prons])
    except KeyError:
        clusters = [
            vowel_cluster for vowel_cluster in re.split(r"[^aeiouy]+", word)]
        diphthongs = [
            "ai", "au", "ay", "ea", "ee", "ei", "ey", "oa", "oe", "oi", "oo",
            "ou", "oy", "ua", "ue", "ui"]
        return sum([
            (min(2, len(vowel_cluster)), 1)[
                vowel_cluster in diphthongs] for vowel_cluster in clusters])


def last_syllable(pron):
    pron = reversed(pron)
    syl = []
    for phoneme in pron:
        syl.append(phoneme)
        if NUM_RE.search(phoneme):
            break
    syl.reverse()
    return tuple(syl)


def extract_rhymes(word):
    word = word.lower()
    try:
        all_prons = PRON_DICT[word]
    except KeyError:
        return None
    return [last_syllable(pron) for pron in all_prons]


def check_rhyme(rhymes1, rhymes2):
    if rhymes1 is None or rhymes2 is None:
        return False
    for rhyme_1 in rhymes1:
        for rhyme_2 in rhymes2:
            if rhyme_1 == rhyme_2:
                return True
    return False


def alliteration(line):
    line = line.lower().split()
    if len(line) == 0:
        return False
    cur_letter = line.pop()[0]
    while len(line) != 0:
        if line[0].startswith(cur_letter):
            return True
        cur_letter = line.pop()[0]
    return False


class AshPaperLine(object):

    def parse(self, line):
        sub_line = line.lower()
        if "/" in line:
            self.command = "COMP"
        elif INT_CAP_RE.search(line):
            self.command = "NEG"
        elif CAP_RE.search(line):
            self.command = "MULT"
        elif SIMILE_RE.search(sub_line):
            self.command = "ADD"
        elif "?" in line:
            self.command = "PRINTCHAR"
        elif "." in line:
            self.command = "PRINT"
        elif "," in line:
            self.command = "POP"
        elif "-" in line:
            self.command = "PUSH"
        elif alliteration(line):
            self.command = "GOTO"
        else:
            self.command = "STORE"

    def __init__(self, line):
        self.line = line
        self.parse(line)
        self.register = int(bool(START_WS_RE.search(line)))
        all_words = line.split()
        self.syllables = sum(count_syllables(word) for word in all_words)
        try:
            self.rhymes = extract_rhymes(all_words[-1])
        except IndexError:
            self.rhymes = None


class AshPaper(object):

    def compile(self, filename):
        with open(filename) as file_:
            for line in file_:
                self.instructions.append(AshPaperLine(line.strip("\n")))

    def run(self):
        while self.instruction_index < len(self.instructions):
            self.execute()
        self.instruction_index = 0

    def execute(self):
        #print self.registers, self.stack
        instruction = self.instructions[self.instruction_index]
        #print instruction.line
        if check_rhyme(self.previous_instruction.rhymes, instruction.rhymes):
            if self.registers[0] < self.registers[1]:
                self.stack.append(self.previous_instruction.syllables)
            else:
                self.stack.append(instruction.syllables)
        elif instruction.command == "STORE":
            self.registers[instruction.register] = instruction.syllables
        elif instruction.command == "GOTO":
            self.previous_instruction = instruction
            self.instruction_index = (
                self.registers[instruction.register] % len(self.instructions))
            self.execute()
            return
        elif instruction.command == "PUSH":
            self.stack.append(self.registers[instruction.register])
        elif instruction.command == "POP":
            try:
                self.registers[instruction.register] = self.stack.pop()
            except IndexError:
                pass
        elif instruction.command == "PRINT":
            sys.stdout.write(str(self.registers[instruction.register]))
        elif instruction.command == "PRINTCHAR":
            sys.stdout.write(chr(self.registers[instruction.register] % 256))
        elif instruction.command == "ADD":
            self.registers[instruction.register] = sum(self.registers)
        elif instruction.command == "MULT":
            self.registers[instruction.register] = (
                self.registers[0] * self.registers[1])
        elif instruction.command == "NEG":
            self.registers[instruction.register] = -self.registers[
                instruction.register]
        elif instruction.command == "NOOP":
            pass
        elif instruction.command == "COMP":
            if self.registers[instruction.register] > instruction.syllables:
                self.previous_instruction = instruction
                self.instruction_index = (
                    self.registers[(instruction.register + 1) % 2] %
                    len(self.instructions))
                self.execute()
                return
        #print instruction.line, self.registers[0], self.registers[1],\
        #    self.stack
        # print "{}{}|   {}   |   {}   |   {}   |".format(
        #    instruction.line, " "*(51-len(instruction.line)),
        #    self.registers[0], self.registers[1], self.stack)
        self.instruction_index += 1
        self.previous_instruction = instruction

    def __init__(self):
        self.stack = []
        self.registers = [0, 0]
        self.instructions = []
        self.instruction_index = 0
        self.previous_instruction = AshPaperLine("")

if __name__ == "__main__":
    machine = AshPaper()
    machine.compile(sys.argv[1])
    machine.run()
    #print("\n\nEnd run report:")
    #print("\tRegisters: {}".format(machine.registers))
    #print("\tStack: {}".format(machine.stack))

import sys


def greet(name: str) -> str:
    return f"Hallo, {name}!"


if __name__ == "__main__":
    who = sys.argv[1] if len(sys.argv) > 1 else "Welt"
    print(greet(who))

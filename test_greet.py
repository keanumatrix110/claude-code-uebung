from greet import greet


def test_greet_with_name():
    assert greet("Anna") == "Hallo, Anna!"


def test_greet_with_empty_string():
    assert greet("") == "Hallo, !"

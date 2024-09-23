def float_range(start: int, stop: int, floats: int = 2, step: int = 1):
    return [i / floats for i in range(start, (stop - 1) * floats + 1, step)]

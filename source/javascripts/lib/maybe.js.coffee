
@maybe = (fn) -> (val) -> if val? then fn(val) else val

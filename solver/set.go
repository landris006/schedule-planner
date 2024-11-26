package solver

type Set[T comparable] interface {
	Insert(elem T)
	Contains(elem T) bool
	Elements() []T
	Union(o Set[T]) Set[T]
	Intersection(o Set[T]) Set[T]
	Size() int
}

type set[T comparable] struct {
	storage map[T]struct{}
}

func (_set set[T]) Insert(elem T) {
	_set.storage[elem] = struct{}{}
}

func (_set set[T]) Contains(elem T) bool {
	_, ok := _set.storage[elem]
	return ok
}

func (_set set[T]) Elements() []T {
	i := 0
	keys := make([]T, len(_set.storage))
	for k := range _set.storage {
		keys[i] = k
		i++
	}
	return keys
}

func (_set set[T]) Union(o Set[T]) Set[T] {
	var out = EmptySet[T]()

	for k := range _set.storage {
		out.Insert(k)
	}
	for _, k := range o.Elements() {
		out.Insert(k)
	}

	return out
}

func (_set set[T]) Intersection(o Set[T]) Set[T] {
	var out = EmptySet[T]()

	for _, k := range o.Elements() {
		_, ok := _set.storage[k]
		if ok {
			out.Insert(k)
		}
	}

	return out
}

func (_set set[T]) Size() int {
	return len(_set.storage)
}

func EmptySet[T comparable]() Set[T] {
	return set[T]{make(map[T]struct{})}
}

// Nincsen function overload :(
func CreateSet[T comparable](elements ...T) Set[T] {
	var _set = set[T]{make(map[T]struct{})}
	for _, element := range elements {
		_set.Insert(element)
	}
	return _set
}

package solver

type Set[T comparable] interface {
	Insert(elem T)
	Remove(elem T)
	Contains(elem T) bool
	Elements() []T
	Union(o Set[T]) Set[T]
	Intersection(o Set[T]) Set[T]
	Minus(o Set[T]) Set[T]
	Equals(o Set[T]) bool
	IsSubsetOf(o Set[T]) bool
	Size() int
	IsEmpty() bool
}

type set[T comparable] struct {
	storage map[T]struct{}
}

func (_set set[T]) Insert(elem T) {
	_set.storage[elem] = struct{}{}
}

func (_set set[T]) Remove(elem T) {
	delete(_set.storage, elem)
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

func (_set set[T]) Minus(o Set[T]) Set[T] {
	var out = EmptySet[T]()

	for _, k := range _set.Elements() {
		if !o.Contains(k) {
			out.Insert(k)
		}
	}

	return out
}

func (_set set[T]) Size() int {
	return len(_set.storage)
}

func (_set set[T]) IsEmpty() bool {
	return _set.Size() == 0
}

func (_set set[T]) Equals(o Set[T]) bool {
	size_a := _set.Size()
	size_b := o.Size()
	return size_a == size_b && size_a == _set.Intersection(o).Size()
}

func (_set set[T]) IsSubsetOf(o Set[T]) bool {
	return _set.Equals(_set.Intersection(o))
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

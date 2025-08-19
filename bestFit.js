export function bestFit(partitions, process_size) {
    let min_diff = Infinity;
    let index = null;
    partitions.forEach((p, i) => {
        if (p.max_empty_size >= process_size && p.max_empty_size - process_size < min_diff) {
            min_diff = p.max_empty_size - process_size;
            index = i;
        }
    });
    return index;
}
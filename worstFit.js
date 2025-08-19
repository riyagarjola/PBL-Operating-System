export function worstFit(partitions, process_size) {
    let max_diff = -1;
    let index = null;
    partitions.forEach((p, i) => {
        if (p.max_empty_size >= process_size && p.max_empty_size - process_size > max_diff) {
            max_diff = p.max_empty_size - process_size;
            index = i;
        }
    });
    return index;
}
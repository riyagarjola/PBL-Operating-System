export function firstFit(partitions, process_size) {
    for (let i = 0; i < partitions.length; i++) {
        if (partitions[i].max_empty_size >= process_size) return i;
    }
    return null;
}
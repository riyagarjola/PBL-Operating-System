import { firstFit } from './firstFit.js';
import { bestFit } from './bestFit.js';
import { worstFit } from './worstFit.js';

let pid_counter = 0;

class Process {
    constructor(size, offset = 0) {
        this.index = pid_counter++;
        this.size = size;
        this.offset = offset;
    }
}

class Partition {
    constructor(size) {
        this.size = size;
        this.processes = [];
        this.max_empty_size = size;
    }

    reset() {
        this.processes = [];
        this.max_empty_size = this.size;
    }

    update_max_empty_size() {
        const status_map = this.get_status_map();
        this.max_empty_size = 0;
        let max_empty = 0;
        for (let i = 0; i < this.size; i++) {
            if (!status_map[i]) {
                max_empty++;
                this.max_empty_size = Math.max(this.max_empty_size, max_empty);
            } else {
                max_empty = 0;
            }
        }
    }

    allocate(process) {
        if (process.size > this.max_empty_size) return false;
        const status_map = this.get_status_map();
        for (let i = 0; i <= this.size - process.size; i++) {
            let fits = true;
            for (let j = i; j < i + process.size; j++) {
                if (status_map[j]) {
                    fits = false;
                    break;
                }
            }
            if (fits) {
                process.offset = i;
                this.processes.push(process);
                this.update_max_empty_size();
                return true;
            }
        }
        return false;
    }

    deallocate(process_id) {
        const index = this.processes.findIndex(p => p.index === process_id);
        if (index !== -1) {
            this.processes.splice(index, 1);
            this.update_max_empty_size();
            return true;
        }
        return false;
    }

    get_status_map() {
        const status_map = new Array(this.size).fill(false);
        for (const p of this.processes) {
            for (let i = p.offset; i < p.offset + p.size; i++) {
                status_map[i] = true;
            }
        }
        return status_map;
    }
}

class MemoryAllocationSimulator {
    constructor() {
        this.partitions = [];
        this.processes = [];
        this.tasks = [];
        this.alert_process = [];
        this.memory_size = 0;
        this.canvas = document.getElementById('memory-canvas').getContext('2d');
        this.task_list = document.getElementById('task-list');
        this.current_process_list = document.getElementById('current-process-list');
        this.log_text = document.getElementById('log-text');
        this.memory_size_var = document.getElementById('memory-size-var');
        this.partition_var = document.getElementById('partition-var');
        this.init_events();
    }

    init_events() {
        document.getElementById('demo-button').addEventListener('click', () => this.demo_data());
        document.getElementById('update-button').addEventListener('click', () => {
            const partition_sizes_str = this.partition_var.value;
            const memory_size_str = this.memory_size_var.value;
            if (partition_sizes_str && memory_size_str) this.get_initial_memory_setup(partition_sizes_str, memory_size_str);
        });
        document.getElementById('reset-button').addEventListener('click', () => this.reset());
        document.getElementById('push-button').addEventListener('click', () => {
            const input = document.getElementById('entry-process-size').value;
            if (input) this.push_task(input);
            document.getElementById('entry-process-size').value = '';
        });
        document.getElementById('allocate-button').addEventListener('click', () => {
            const algorithm = document.getElementById('algorithm-select').value;
            this.allocate(algorithm);
            this.update_memory_view();
            this.update_status_view();
        });
        this.current_process_list.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                const process_id = parseInt(e.target.textContent.match(/Process (\d+)/)[1]);
                this.alert_process = [process_id];
                this.update_memory_view();
            }
        });
        this.current_process_list.addEventListener('dblclick', (e) => {
            if (e.target.tagName === 'LI') {
                const process_id = parseInt(e.target.textContent.match(/Process (\d+)/)[1]);
                this.deallocate(process_id);
                this.update_memory_view();
                this.update_status_view();
            }
        });
        this.task_list.addEventListener('dblclick', (e) => {
            if (e.target.tagName === 'LI') {
                const task_size = parseInt(e.target.textContent.match(/Task: (\d+)/)[1]);
                const index = this.tasks.indexOf(task_size);
                if (index !== -1) this.tasks.splice(index, 1);
                this.update_status_view();
            }
        });
    }

    demo_data() {
        this.memory_size = 280;
        this.partitions = [new Partition(100), new Partition(140), new Partition(40)];
        this.tasks = [80, 30, 130, 25];
        this.memory_size_var.value = this.memory_size;
        this.partition_var.value = '100 140 40';
        this.log('Demo data loaded.');
        this.update_memory_view();
        this.update_status_view();
    }

    get_initial_memory_setup(partition_sizes_str, memory_size_str) {
        const sizes = partition_sizes_str.split(' ').map(Number).filter(n => n > 0);
        const user_memory_size = parseInt(memory_size_str);
        if (sizes.length === 0 || user_memory_size <= 0 || isNaN(user_memory_size)) {
            alert('Invalid memory or partition sizes.');
            return;
        }
        const total_partition_size = sizes.reduce((a, b) => a + b, 0);
        if (total_partition_size > user_memory_size) {
            alert('Total partition size exceeds memory size.');
            return;
        }
        this.partitions = sizes.map(size => new Partition(size));
        this.memory_size = user_memory_size;
        this.memory_size_var.value = this.memory_size;
        this.partition_var.value = partition_sizes_str;
        this.log('Memory configuration updated.');
        this.update_memory_view();
    }

    push_task(input_task_list_str) {
        const tasks = input_task_list_str.split(' ').map(Number).filter(n => n > 0);
        if (tasks.length === 0) {
            alert('Process size must be greater than 0.');
            return;
        }
        this.tasks.push(...tasks);
        this.log(`[info] Task [${tasks.join(', ')}] pushed.`);
        this.update_status_view();
    }

    update_memory_view() {
        this.canvas.clearRect(0, 0, 200, 600);
        const width = 50;
        const gap = 5;
        let y = 50;
        const vis_height = 500;
        for (const partition of this.partitions) {
            const height = (partition.size / this.memory_size) * vis_height;
            this.canvas.fillStyle = 'lightblue';
            this.canvas.fillRect(50, y, width, height);
            this.canvas.strokeStyle = 'black';
            this.canvas.strokeRect(50, y, width, height);
            this.canvas.fillStyle = 'black';
            this.canvas.textAlign = 'center';
            this.canvas.fillText(`${partition.size}Kb`, 75, y + height / 2);

            for (const p of partition.processes) {
                const p_y = y + (p.offset / partition.size) * height;
                const p_height = (p.size / partition.size) * height;
                this.canvas.fillStyle = this.alert_process.includes(p.index) ? 'red' : 'lightgreen';
                this.canvas.fillRect(50, p_y, width, p_height);
                this.canvas.strokeRect(50, p_y, width, p_height);
                this.canvas.fillStyle = 'black';
                this.canvas.fillText(`${p.size}Kb`, 75, p_y + p_height / 2);
            }

            y += height + gap;
        }
        this.alert_process = [];
    }

    update_status_view() {
        this.task_list.innerHTML = '';
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = `Task: ${task} Kb`;
            this.task_list.appendChild(li);
        });

        this.current_process_list.innerHTML = '';
        this.processes.forEach(process => {
            const li = document.createElement('li');
            li.textContent = `Process ${process.index} : ${process.size}Kb`;
            this.current_process_list.appendChild(li);
        });
    }

    deallocate(process_id) {
        for (const partition of this.partitions) {
            if (partition.deallocate(process_id)) {
                this.processes = this.processes.filter(p => p.index !== process_id);
                this.log(`Process ${process_id} deallocated.`);
                return;
            }
        }
    }

    allocate(algorithm) {
        if (this.tasks.length === 0) return;
        const process_size = this.tasks.shift();
        let block_index = null;
        if (algorithm === 'First Fit') {
            block_index = firstFit(this.partitions, process_size);
        } else if (algorithm === 'Best Fit') {
            block_index = bestFit(this.partitions, process_size);
        } else if (algorithm === 'Worst Fit') {
            block_index = worstFit(this.partitions, process_size);
        }
        if (block_index !== null) {
            const process = new Process(process_size);
            if (this.partitions[block_index].allocate(process)) {
                this.processes.push(process);
                this.log(`[info] Process ${process.index} (${process_size}Kb) allocated using ${algorithm}.`);
            } else {
                this.log('[error] Allocation failed within partition.');
            }
        } else {
            this.log('[error] Memory allocation failed. No suitable partition found.');
        }
        this.update_memory_view();
        this.update_status_view();
    }

    reset() {
        this.processes = [];
        this.tasks = [];
        this.partitions.forEach(p => p.reset());
        this.memory_size_var.value = '';
        this.partition_var.value = '';
        this.log('Simulator reset.');
        this.update_memory_view();
        this.update_status_view();
    }

    log(message) {
        this.log_text.value += `${message}\n`;
        this.log_text.scrollTop = this.log_text.scrollHeight;
    }
}

const simulator = new MemoryAllocationSimulator();
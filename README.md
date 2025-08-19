# 🧠 Memory Allocator in Operating Systems

A simple memory allocator built from scratch to simulate dynamic memory management in operating systems. This project demonstrates how memory can be allocated, deallocated, and managed manually using techniques such as **First Fit**, **Best Fit**, or **Worst Fit**.

## 🚀 Features

- Manual memory allocation and deallocation (`malloc`, `free` simulation)
- Supports **First Fit**, **Best Fit**, and **Worst Fit** strategies.
- Memory block splitting and merging (coalescing) on deallocation.
- Basic error handling (out-of-memory, invalid free, etc.)
- Simple console interface to interact and test allocator.

## 🛠️ Technologies Used

- Language: C / C++ / Python
- OS Concepts: Heap management, fragmentation, pointers, linked lists
- Tools: GCC / Clang / GDB for debugging


## ⚙️ How It Works

1. The allocator manages a fixed-size block of memory (simulated using an array or pointer).
2. Memory is divided into blocks, each with a header containing metadata (size, status, next).
3. Allocation searches the list for a suitable block using the selected strategy.
4. Deallocation marks the block as free and coalesces adjacent free blocks to prevent fragmentation.





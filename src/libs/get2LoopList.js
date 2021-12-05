/*双向循环链表*/
export default function get2LoopList() {
    var Node = function (element) {
        this.element = element;
        this.next = null;
        this.prev = null;
    };

    var length = 0,
        head = null,
        tail = null;

    this.append = function (element) {
        var node = new Node(element),
            current,
            previous;

        if (!head) {
            head = node;
            tail = node;
            head.prev = tail;
            tail.next = head;
        } else {
            current = head;

            while (current.next !== head) {
                previous = current;
                current = current.next;
            }

            current.next = node;
            node.next = head;
            node.prev = current;
        };

        head.prev = node;

        length++;
        return true;
    };


    this.getHead = function () {
        return head;
    };

    this.getTail = function () {
        return tail;
    };

    this.size = function () {
        return length;
    };
}
int secondLargest(List<int> arr) {
  arr.sort();
  return arr[arr.length - 2];
}

void main() {
  List<int> numbers = [3, 5, 7, 2, 8];
  int result = secondLargest(numbers);
  print("The second largest number is: $result");
}

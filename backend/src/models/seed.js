import mongoose from "mongoose";
import Question from "./question.model.js"; // ✅ Make sure this is correct

const MONGO_URI =
  "mongodb+srv://arjunchandel910:j7pnGgLqNgRkJ8xS@bytecode.hyz8xql.mongodb.net/?retryWrites=true&w=majority&appName=ByteCode";

const startCode = {
  java: `class Solution {
    public int sum(int a, int b) {
        // Write your code here
    }
}`,
  python: `class Solution:
    def sum(self, a: int, b: int) -> int:
        # Write your code here
        pass`,
  cpp: `class Solution {
public:
    int sum(int a, int b) {
        // Write your code here
    }
};`,
  javascript: `class Solution {
  sum(a, b) {
    // Write your code here
  }
}`,
};

const hiddenCode = {
  java: `import java.util.*;

// USER CODE HERE

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(new Solution().sum(a, b));
    }
}`,

  python: `# USER CODE HERE

a, b = map(int, input().split())
print(Solution().sum(a, b))`,

  cpp: `// USER CODE HERE

#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    Solution obj;
    cout << obj.sum(a, b);
    return 0;
}`,

  javascript: `// USER CODE HERE

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = [];

rl.on("line", function (line) {
  input.push(...line.split(" ").map(Number));
}).on("close", function () {
  const [a, b] = input;
  const obj = new Solution();
  console.log(obj.sum(a, b));
});`,
};

const main = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    const updated = await Question.findByIdAndUpdate(
      "685ad42bc4916f7e85334021",
      { startCode, hiddenCode },
      { new: true }
    );

    if (!updated) {
      console.log("⚠️ Question not found");
    } else {
      console.log("✅ Updated Question:", updated);
    }

    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
  } catch (err) {
    console.error("❌ Error:", err);
    await mongoose.disconnect();
    console.log("⚠️ Disconnected after error");
  }
};

main();

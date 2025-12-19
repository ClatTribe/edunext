// Create this file: src/app/test-markdown/page.tsx
// Then visit: http://localhost:3000/test-markdown

export default function TestMarkdown() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Markdown List Test</h1>
      
      {/* Test 1: Plain HTML Lists */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Test 1: Plain HTML (Should Work)</h2>
        <ul className="list-disc pl-6">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>

      {/* Test 2: With Prose Class */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Test 2: With Prose Class (Should Work)</h2>
        <div className="prose max-w-none">
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      </div>

      {/* Test 3: Simulated Markdown Output */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Test 3: Simulated Markdown HTML</h2>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: `
              <h2>Why Use Markdown Tables?</h2>
              <p>Here are some reasons:</p>
              <ul>
                <li><strong>Simple syntax</strong> - Easy to write</li>
                <li><strong>Version control friendly</strong> - Works with Git</li>
                <li><strong>Cross-platform</strong> - Renders everywhere</li>
              </ul>
              <h3>Numbered List Test</h3>
              <ol>
                <li>First item</li>
                <li>Second item</li>
                <li>Third item</li>
              </ol>
            `
          }}
        />
      </div>

      {/* Test 4: Check Browser DevTools */}
      <div className="mb-8 p-4 border rounded bg-yellow-50">
        <h2 className="text-xl font-bold mb-4">🔍 Debugging Steps:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Open browser DevTools (F12)</li>
          <li>Inspect the list elements in Test 2 or 3</li>
          <li>Check if they have <code className="bg-gray-200 px-2 py-1 rounded">list-style-type: disc</code></li>
          <li>Check if they have <code className="bg-gray-200 px-2 py-1 rounded">display: list-item</code></li>
          <li>Look for any CSS that's setting <code className="bg-gray-200 px-2 py-1 rounded">list-style: none</code></li>
        </ol>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">📋 What to Check:</h3>
        <p className="mb-2">If Test 1 works but Test 2/3 don't:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>The prose class is being overridden</li>
          <li>Check your globals.css file</li>
          <li>Make sure @tailwindcss/typography is installed</li>
        </ul>
      </div>
    </div>
  );
}
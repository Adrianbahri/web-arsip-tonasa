const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  {
    regex: /className="bg-amber-50 border border-amber-200 text-amber-800([^"]*)"/g,
    replace: 'className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400$1"'
  },
  {
    regex: /className="bg-purple-50 border border-purple-200 text-purple-800([^"]*)"/g,
    replace: 'className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-800 dark:text-purple-400$1"'
  },
  {
    regex: /className="bg-blue-50 border border-blue-200 text-blue-800([^"]*)"/g,
    replace: 'className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-400$1"'
  },
  {
    regex: /className="bg-emerald-50 border border-emerald-200 text-emerald-800([^"]*)"/g,
    replace: 'className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400$1"'
  },
  {
    regex: /className="mb-4 p-4 bg-red-50 border border-red-200 rounded-sm text-red-800([^"]*)"/g,
    replace: 'className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm text-red-800 dark:text-red-400$1"'
  },
  {
    regex: /className="bg-red-50 border border-red-200 text-primary([^"]*)"/g,
    replace: 'className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-primary dark:text-red-400$1"'
  },
  {
    regex: /className="mb-4 bg-red-50 border border-red-200 text-red-700([^"]*)"/g,
    replace: 'className="mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400$1"'
  },
  {
    regex: /className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300([^"]*)"/g,
    replace: 'className="bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30$1"'
  },
  {
    regex: /className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300([^"]*)"/g,
    replace: 'className="bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30$1"'
  },
  {
    regex: /className="bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300([^"]*)"/g,
    replace: 'className="bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30$1"'
  },
  {
    regex: /className="flex-1 md:flex-none bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200([^"]*)"/g,
    replace: 'className="flex-1 md:flex-none bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20$1"'
  },
  {
    regex: /'bg-amber-50 text-amber-700 border border-amber-200'/g,
    replace: "'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'"
  },
  {
    regex: /'bg-red-50 text-red-700 border border-red-200'/g,
    replace: "'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'"
  },
  {
    regex: /'bg-amber-50 text-amber-700 border-amber-200'/g,
    replace: "'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'"
  },
  {
    regex: /className="bg-amber-50 text-amber-700 border border-amber-200([^"]*)"/g,
    replace: 'className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20$1"'
  },
  {
    regex: /className="bg-emerald-50 text-emerald-700 border border-emerald-200([^"]*)"/g,
    replace: 'className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20$1"'
  },
  {
    regex: /'bg-blue-50 text-blue-700'/g,
    replace: "'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'"
  },
  {
    regex: /'bg-purple-50 text-purple-700'/g,
    replace: "'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'"
  },
  {
    regex: /className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200([^"]*)"/g,
    replace: 'className="bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20$1"'
  },
  {
    regex: /className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200([^"]*)"/g,
    replace: 'className="bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20$1"'
  },
  {
    regex: /className="flex items-center gap-1 border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-700([^"]*)"/g,
    replace: 'className="flex items-center gap-1 border border-emerald-600 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400$1"'
  }
];

let replaced = 0;
replacements.forEach(r => {
  const matchCount = (content.match(r.regex) || []).length;
  if (matchCount > 0) {
    content = content.replace(r.regex, r.replace);
    replaced += matchCount;
  }
});

fs.writeFileSync(file, content);
console.log(`Colors updated. ${replaced} replacements made.`);

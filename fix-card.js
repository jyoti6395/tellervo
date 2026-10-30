const fs = require('fs');
const pcPath = 'apps/tellervo-app/src/components/shop/ProductCard.tsx';
let pc = fs.readFileSync(pcPath, 'utf8');

// 1. Remove padding from outer card div
pc = pc.replace(
  'className={`bg-white rounded-3xl p-3 sm:p-3.5 border border-[#EAE4D7]',
  'className={`bg-white rounded-3xl border border-[#EAE4D7]'
);

// 2. Make image area full-bleed (no margin, no inner rounded-2xl, full width)
pc = pc.replace(
  'className="relative rounded-2xl overflow-hidden aspect-square mb-2.5 bg-[#F6F3EB] cursor-pointer"',
  'className="relative w-full aspect-square bg-[#F6F3EB] cursor-pointer overflow-hidden"'
);

// 3. Make sure content details container has a matching closing tag
const targetBottom = `        )}
      </div>
      {/* Centered Out of Stock Overlay with subtle card blur */}`;

const correctedBottom = `        )}
        </div>
      </div>
      {/* Centered Out of Stock Overlay with subtle card blur */}`;

if (!pc.includes('        </div>\n      </div>\n      {/* Centered Out of Stock Overlay') && !pc.includes('        </div>\r\n      </div>\r\n      {/* Centered Out of Stock Overlay')) {
  pc = pc.replace(targetBottom, correctedBottom);
  pc = pc.replace(targetBottom.replace(/\n/g, '\r\n'), correctedBottom.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(pcPath, pc, 'utf8');
console.log('ProductCard.tsx updated cleanly');


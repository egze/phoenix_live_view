import { Rendered } from "../js/phoenix_live_view"

const STATIC = "s"
const DYNAMICS = "d"
const COMPONENTS = "c"

describe("Rendered", () => {
  describe("mergeDiff", () => {
    test("recursively merges two diffs", () => {
      let simple = new Rendered("123", simpleDiff1)
      simple.mergeDiff(simpleDiff2)
      expect(simple.get()).toEqual({...simpleDiffResult, [COMPONENTS]: {}})

      let deep = new Rendered("123", deepDiff1)
      deep.mergeDiff(deepDiff2)
      expect(deep.get()).toEqual({...deepDiffResult, [COMPONENTS]: {}})
    })

    test("merges the latter diff if it contains a `static` key", () => {
      const diff1 = { 0: ["a"], 1: ["b"] }
      const diff2 = { 0: ["c"], [STATIC]: "c"}
      let rendered = new Rendered("123", diff1)
      rendered.mergeDiff(diff2)
      expect(rendered.get()).toEqual(diff2)
    })

    test("replaces a string when a map is returned", () => {
      const diff1 = { 0: { 0: "<button>Press Me</button>", [STATIC]: "" } }
      const diff2 = { 0: { 0: { 0: "val", [STATIC]: "" }, [STATIC]: ""} }
      let rendered = new Rendered("123", diff1)
      rendered.mergeDiff(diff2)
      expect(rendered.get()).toEqual({...diff2, [COMPONENTS]: {}})
    })

    test("replaces a map when a string is returned", () => {
      const diff1 = { 0: { 0: { 0: "val", [STATIC]: "" }, [STATIC]: "" } }
      const diff2 = { 0: { 0: "<button>Press Me</button>", [STATIC]: ""} }
      let rendered = new Rendered("123", diff1)
      rendered.mergeDiff(diff2)
      expect(rendered.get()).toEqual({...diff2, [COMPONENTS]: {}})
    })
  })

  describe("isNewFingerprint", () => {
    test("returns true if `diff.static` is truthy", () => {
      const diff = { [STATIC]: ["<h2>"] }
      let rendered = new Rendered("123", {})
      expect(rendered.isNewFingerprint(diff)).toEqual(true)
    })

    test("returns false if `diff.static` is falsy", () => {
      const diff = { [STATIC]: undefined }
      let rendered = new Rendered("123", {})
      expect(rendered.isNewFingerprint(diff)).toEqual(false)
    })

    test("returns false if `diff` is undefined", () => {
      let rendered = new Rendered("123", {})
      expect(rendered.isNewFingerprint()).toEqual(false)
    })

    test("expands shared static from cids", () => {
      const mountDiff = {
        "0": {
          "0": "<a data-phx-link=\"patch\" data-phx-link-state=\"push\" href=\"/posts/new\">New Post</a>",
          "1": "",
          "2": {"d": [[0], [1]], "s": ["", ""]},
          "s": [
            "<h1>Timeline</h1>\n\n<span>",
            "</span>\n\n",
            "\n<div id=\"posts\" phx-update=\"prepend\">\n",
            "</div>\n\n"
          ]
        },
        "c": {
          "0": {
            "0": "1005",
            "1": "chris_mccord",
            "2": "new",
            "3": "0",
            "4": "0",
            "5": "0",
            "6": "0",
            "7": "<a data-phx-link=\"patch\" data-phx-link-state=\"push\" href=\"/posts/1005/edit\">\n        Edit\n      </a>",
            "8": "<a data-confirm=\"Are you sure?\" href=\"#\" phx-click=\"delete\" phx-value-id=\"1005\">\n        <i class=\"far fa-trash-alt\"></i>\n      </a>",
            "s": [
              "<div id=\"post-",
              "\" class=\"post\">\n  <div class=\"row\">\n    <div class=\"column column-10\">\n      <div class=\"post-avatar\"></div>\n    </div>\n    <div class=\"column column-90 post-body\">\n      <b>@",
              "</b>\n      <br/>\n      ",
              "\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"column\">\n      <a href=\"#\" phx-click=\"like\" phx-target=\"",
              "\">\n        <i class=\"far fa-heart\"></i> ",
              "\n      </a>\n    </div>\n    <div class=\"column\">\n      <a href=\"#\" phx-click=\"repost\" phx-target=\"",
              "\">\n        <i class=\"far fa-retweet\"></i> ",
              "\n      </a>\n    </div>\n    <div class=\"column\">\n      ",
              "\n      ",
              "\n    </div>\n  </div>\n</div>\n"
            ]
          },
          "1": {
            "0": "1004",
            "1": "chris_mccord",
            "2": "tesitnglkjsldkfjsf",
            "3": "1",
            "4": "3",
            "5": "1",
            "6": "8",
            "7": "<a data-phx-link=\"patch\" data-phx-link-state=\"push\" href=\"/posts/1004/edit\">\n        Edit\n      </a>",
            "8": "<a data-confirm=\"Are you sure?\" href=\"#\" phx-click=\"delete\" phx-value-id=\"1004\">\n        <i class=\"far fa-trash-alt\"></i>\n      </a>",
            "s": 0
          }
        },
        "s": ["<main>\n", "</main>\n"],
        "title": "Listing Posts"
      }
      const updateDiff = {
        "0": {"2": {"d": [[2]]}},
        "c": {
          "2": {
            "0": "1006",
            "1": "chris_mccord",
            "2": "new",
            "3": "2",
            "4": "0",
            "5": "2",
            "6": "0",
            "7": "<a data-phx-link=\"patch\" data-phx-link-state=\"push\" href=\"/posts/1006/edit\">\n        Edit\n      </a>",
            "8": "<a data-confirm=\"Are you sure?\" href=\"#\" phx-click=\"delete\" phx-value-id=\"1006\">\n        <i class=\"far fa-trash-alt\"></i>\n      </a>",
            "s": 1
          }
        }
      }
      let rendered = new Rendered("123", mountDiff)
      expect(rendered.get()["c"]["0"][STATIC]).toEqual(rendered.get()["c"]["1"][STATIC])
      rendered.mergeDiff(updateDiff)
      let sharedStatic = rendered.get()["c"]["0"][STATIC]
      expect(sharedStatic).toBeTruthy()
      expect(sharedStatic).toEqual(rendered.get()["c"]["1"][STATIC])
      expect(sharedStatic).toEqual(rendered.get()["c"]["2"][STATIC])
    })
  })

  describe("toString", () => {
    test("stringifies a diff", () => {
      let rendered = new Rendered("123", simpleDiffResult)
      expect(rendered.toString().trim()).toEqual(
`<div class="thermostat">
  <div class="bar cooling">
    <a href="#" phx-click="toggle-mode">cooling</a>
    <span>07:15:04 PM</span>
  </div>
</div>`.trim())
    })
  })
})

const simpleDiff1 = {
  '0': 'cooling',
  '1': 'cooling',
  '2': '07:15:03 PM',
  [STATIC]: [
    '<div class="thermostat">\n  <div class="bar ',
    '">\n    <a href="#" phx-click="toggle-mode">',
    '</a>\n    <span>',
    '</span>\n  </div>\n</div>\n',
  ]
};

const simpleDiff2 = {
  '2': '07:15:04 PM',
};

const simpleDiffResult = {
  '0': 'cooling',
  '1': 'cooling',
  '2': '07:15:04 PM',
  [STATIC]: [
    '<div class="thermostat">\n  <div class="bar ',
    '">\n    <a href="#" phx-click="toggle-mode">',
    '</a>\n    <span>',
    '</span>\n  </div>\n</div>\n',
  ]
};

const deepDiff1 = {
  '0': {
    '0': {
      [DYNAMICS]: [['user1058', '1'], ['user99', '1']],
      [STATIC]: ['        <tr>\n          <td>', ' (', ')</td>\n        </tr>\n'],
    },
    [STATIC]: [
      '  <table>\n    <thead>\n      <tr>\n        <th>Username</th>\n        <th></th>\n      </tr>\n    </thead>\n    <tbody>\n',
      '    </tbody>\n  </table>\n',
    ],
  },
  '1': {
    [DYNAMICS]: [
      [
        'asdf_asdf',
        'asdf@asdf.com',
        '123-456-7890',
        '<a href="/users/1">Show</a>',
        '<a href="/users/1/edit">Edit</a>',
        '<a href="#" phx-click="delete_user" phx-value="1">Delete</a>',
      ],
    ],
    [STATIC]: [
      '    <tr>\n      <td>',
      '</td>\n      <td>',
      '</td>\n      <td>',
      '</td>\n\n      <td>\n',
      '        ',
      '\n',
      '      </td>\n    </tr>\n',
    ],
  }
};

const deepDiff2 = {
  '0': {
    '0': {
      [DYNAMICS]: [['user1058', '2']],
    },
  }
};

const deepDiffResult = {
  '0': {
    '0': {
      [DYNAMICS]: [['user1058', '2']],
      [STATIC]: ['        <tr>\n          <td>', ' (', ')</td>\n        </tr>\n'],
    },
    [STATIC]: [
      '  <table>\n    <thead>\n      <tr>\n        <th>Username</th>\n        <th></th>\n      </tr>\n    </thead>\n    <tbody>\n',
      '    </tbody>\n  </table>\n',
    ],
  },
  '1': {
    [DYNAMICS]: [
      [
        'asdf_asdf',
        'asdf@asdf.com',
        '123-456-7890',
        '<a href="/users/1">Show</a>',
        '<a href="/users/1/edit">Edit</a>',
        '<a href="#" phx-click="delete_user" phx-value="1">Delete</a>',
      ],
    ],
    [STATIC]: [
      '    <tr>\n      <td>',
      '</td>\n      <td>',
      '</td>\n      <td>',
      '</td>\n\n      <td>\n',
      '        ',
      '\n',
      '      </td>\n    </tr>\n',
    ],
  }
};
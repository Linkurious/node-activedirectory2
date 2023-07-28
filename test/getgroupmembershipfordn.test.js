'use strict'

const tap = require('tap')
const ActiveDirectory = require('../index')
const config = require('./config')
const serverFactory = require('./mockServer')
const settings = require('./settings').getGroupMembershipForDN

tap.beforeEach((done, t) => {
  serverFactory(function (err, server) {
    if (err) return done(err)
    const connectionConfig = config(server.port)
    t.context.ad = new ActiveDirectory(connectionConfig)
    t.context.server = server
    done()
  })
})

tap.afterEach((done, t) => {
  if (t.context.server) t.context.server.close()
  done()
})

tap.test('#getGroupMembershipForDN()', t => {
  settings.groups.forEach((group) => {
    t.test(`should return groups (with nested groups) for ${group.dn}`, t => {
      const opts = { supportNestedGroups: true }
      const expectedGroups = [...group.groups, ...group.nestedGroups]
      t.context.ad.getGroupMembershipForDN(opts, group.dn, undefined, function (err, groups) {
        t.error(err)
        t.ok(groups)
        t.type(groups, Array)

        const cns = groups.map((g) => g.cn)
        expectedGroups.forEach(group => t.true(cns.includes(group)))

        t.end()
      })
    })

    t.test(`should return groups (without nested groups) for ${group.dn}`, t => {
      const opts = { supportNestedGroups: false }
      const expectedGroups = group.groups
      t.context.ad.getGroupMembershipForDN(opts, group.dn, undefined, function (err, groups) {
        t.error(err)
        t.ok(groups)
        t.type(groups, Array)

        const cns = groups.map((g) => g.cn)
        expectedGroups.forEach(group => t.true(cns.includes(group)))

        t.end()
      })
    })
  })

  t.end()
})

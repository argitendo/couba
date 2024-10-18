"use client"

import Login from './login'
import { Layout } from '../layouts';

function index() {
  return (
    <Layout.Secondary>
      <Login />
    </Layout.Secondary>
  )
}

export default index
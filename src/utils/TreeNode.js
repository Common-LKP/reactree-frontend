/* eslint-disable no-underscore-dangle */
import { v4 as uuidv4 } from "uuid";

function TreeNode() {
  this.name = "";
  this.props = [];
  this.state = [];
  this.reduxState = [];
  this.uuid = uuidv4();
  this.children = [];
}

const pushState = function (memoizedState, stateArray, reduxStateArray) {
  if (memoizedState === null) return;

  if (memoizedState.baseState) {
    stateArray.push(JSON.stringify(memoizedState.baseState));
  }

  if (memoizedState.queue?.value) {
    reduxStateArray.push(JSON.stringify(memoizedState.queue.value, null, 2));
  }

  pushState(memoizedState.next, stateArray, reduxStateArray);
};

TreeNode.prototype.addChild = function (child) {
  this.children.unshift(child);
};

TreeNode.prototype.setName = function (node) {
  this.tag = node.tag;
  this.file = node._debugSource;

  if (node.tag === 0) {
    this.name = node.elementType.name;
  } else if (node.tag === 3) {
    this.name = "root";
  } else if (node.tag === 6) {
    this.name = node.memoizedProps;
  } else if (node.tag === 8) {
    this.name = "React.StrictMode";
  } else if (node.tag === 15) {
    this.name = "SimpleMemoComponent";
  } else {
    this.name = node.elementType;
  }
};

TreeNode.prototype.addProps = function (node) {
  if (!node.memoizedProps) return;

  if (node.tag === 0 || node.tag === 1) {
    Object.values(node.memoizedProps).forEach(item => this.props.push(item));
  }
};

TreeNode.prototype.addState = function (node) {
  if (!node.memoizedState) return;

  if (node.tag === 0 || node.tag === 1) {
    pushState(node.memoizedState, this.state, this.reduxState);
  }
};

export default TreeNode;

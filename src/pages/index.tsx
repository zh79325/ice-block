import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { CloseOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Divider, Flex, Form, Input, InputNumber, Select, Slider, Space } from 'antd';
import styles from './room/index.module.css';
import wall from './room/wall';
import ground from './room/ground';


interface Block {
  width: number;
  height: number;
}
interface BlockInstance extends Block{
  name:string;
}

interface SbuBlock {
  width: number;
  height: number;
  count: number;
}

interface Room {
  name: string;
  blocks: Array<SbuBlock>;
}

interface House {
  rooms: Array<Room>;
}

interface BlockPos extends BlockInstance {
  x: number;
  y: number;
}

interface BlockSplit {
  block: Block;
  subList: Array<BlockPos>;
}

export default function IndexPage() {
  const defaultBlock: Block = {
    width: 750,
    height: 1500,
  };
  const [block, setBlock] = useState<Block>({
    ...defaultBlock,
  });
  const [result, setResult] = useState({
    area: 0,
    count: 0,
    subTotal: 0,
  });
  const [offset,setOffset]=useState(5)
  const types = {
    wall,
    ground,
  };
  const [splitResultList, setSplitResultList] = useState<Array<BlockSplit>>([]);
  const [house, setHouse] = useState<House>({ ...wall });
  const [type, setType] = useState('wall');
  const [size, setSize] = useState(30);
  const buildSize = (v) => {
    return v / 10 * (0.5 + size / (100 / (5 - 0.5)));
  };


  function findPos(m: BlockSplit, b: Block,off:number) {
    let area = 0;
    let w = 0;
    for (let i = 0; i < m.subList.length; i++) {
      const sb = m.subList[i];
      area += sb.width * sb.height;
      w += sb.width;
      w+=off;
    }
    if (area + b.width * b.height > m.block.width * m.block.height) {
      return null;
    }
    if (w + b.width > m.block.width) {
      return null;
    }
    return {
      x: w,
      y: 0,
    };
  }

  const startCalc = () => {
    let area = 0;
    const blockList: BlockInstance[] = [];
    for (let i = 0; i < house.rooms.length; i++) {
      let room = house.rooms[i];
      for (let j = 0; j < room.blocks.length; j++) {
        let sbuBlock = room.blocks[j];
        area += sbuBlock.width * sbuBlock.height * sbuBlock.count;
        for (let k = 0; k < sbuBlock.count; k++) {
          blockList.push({
            name:room.name,
            width: sbuBlock.width,
            height: sbuBlock.height,
          });
        }
      }
    }
    const sameList: BlockInstance[] = [];
    const sameWidthList: BlockInstance[] = [];
    const sameHeightList: BlockInstance[] = [];
    const otherList: BlockInstance[] = [];
    for (let i = 0; i < blockList.length; i++) {
      let b = blockList[i];
      if (b.width == block.width && b.height == block.height) {
        sameList.push(b);
      } else if (b.width == block.width) {
        sameWidthList.push(b);
      } else if (b.height == block.height) {
        sameHeightList.push(b);
      } else {
        b = {
          ...b,
          width: b.height,
          height: b.width,
        };
        if (b.width == block.width && b.height == block.height) {
          sameList.push(b);
        } else if (b.width == block.width) {
          sameWidthList.push(b);
        } else if (b.height == block.height) {
          sameHeightList.push(b);
        } else {
          otherList.push(b);
        }
      }
    }

    const resultList: Array<BlockSplit> = [];
    for (let i = 0; i < sameList.length; i++) {
      resultList.push({
        block: block,
        subList: [{
          ...sameList[i],
          x: 0,
          y: 0,
        }],
      });
    }
    const wideMergeList: Array<BlockSplit> = [{
      block: block,
      subList: [],

    }];
    while (sameWidthList.length > 0) {
      const b = sameWidthList[0];
      sameWidthList.splice(0, 1);
      let find = false;
      for (let i = 0; i < wideMergeList.length; i++) {
        const m = wideMergeList[i];
        let h = 0;
        for (let j = 0; j < m.subList.length; j++) {
          h += m.subList[j].height;
          h+=offset;
        }
        if (b.height + h < m.block.height) {
          m.subList.push({
            ...b,
            x: 0,
            y: h,
          });
          find = true;
          break;
        }
      }
      if (find) {
        continue;
      }
      wideMergeList.push({
        block: block,
        subList: [{
          ...b,
          x: 0,
          y: 0,
        }],
      });
    }

    const heightMergeList: Array<BlockSplit> = [{
      block: block,
      subList: [],

    }];
    while (sameHeightList.length > 0) {
      const b = sameHeightList[0];
      sameHeightList.splice(0, 1);
      let find = false;
      for (let i = 0; i < heightMergeList.length; i++) {
        const m = heightMergeList[i];
        let w = 0;
        for (let j = 0; j < m.subList.length; j++) {
          w += m.subList[j].width;
          w+=offset;
        }
        if (b.width + w < m.block.width) {
          m.subList.push({
            ...b,
            x: w,
            y: 0,
          });
          find = true;
          break;
        }
      }
      if (find) {
        continue;
      }
      heightMergeList.push({
        block: block,
        subList: [{
          ...b,
          x: 0,
          y: 0,
        }],
      });
    }

    for (let i = 0; i < wideMergeList.length; i++) {
      resultList.push(wideMergeList[i]);
    }
    for (let i = 0; i < heightMergeList.length; i++) {
      resultList.push(heightMergeList[i]);
    }

    otherList.sort((a, b) => a.width * a.height - b.width * b.height);
    for (let i = 0; i < otherList.length; i++) {
      const b = otherList[0];
      if (b.width > block.width || b.height > block.height) {
        const w = b.width;
        b.width = b.height;
        b.height = w;
      }
      otherList.splice(0, 1);
      let find = false;
      for (let i = 0; i < resultList.length; i++) {
        const m = resultList[i];
        const pos = findPos(m, b,offset);
        if (pos != null) {
          m.subList.push({
            ...b,
            x: pos.x,
            y: pos.y,
          });
          find = true;
          break;
        }
      }
      if (find) {
        continue;
      }
      resultList.push({
        block: block,
        subList: [{
          ...b,
          x: 0,
          y: 0,
        }],
      });
    }
    console.log(resultList);
    result.area = area;
    result.subTotal = blockList.length;
    result.count = area / block.width / block.height;
    setResult({ ...result });
    setSplitResultList([...resultList]);
  };
  return (
      <PageContainer>
        <Form>
          <Form.Item label="区域">
            <Select
                value={type}
                options={[{
                  label: '墙面',
                  value: 'wall',
                }, {
                  label: '地面',
                  value: 'ground',
                }]}
                onChange={(e: any) => {
                  setType(e);
                  result.count = 0;
                  setResult({ ...result });
                  setHouse({ ...types[e] });
                }}
            />
          </Form.Item>
          <Form.Item label="瓷砖尺寸">
            <div>
                <InputNumber
                    addonBefore="宽"
                    value={block.width}
                    onChange={(e) => {
                      block.width = e;
                      setBlock({ ...block });
                    }}
                />
                <InputNumber
                    addonBefore="高"
                    value={block.height}
                    onChange={(e) => {
                      block.height = e;
                      setBlock({ ...block });
                    }}
                />
                <InputNumber
                    addonBefore="切割缝隙"
                    value={offset}
                    onChange={(e) => {
                      setOffset(e)
                    }}
                />
            </div>
          </Form.Item>
          <Form.Item>
            <div style={{
              display: 'flex',
              rowGap: 16,
              flexDirection: 'column',
            }}
            >
              <Button
                  type="primary"
                  onClick={() => {
                    house.rooms.push({
                      name: '',
                      blocks: [],
                    });
                    setHouse({ ...house });
                  }}
                  block
              >
                + 添加房间
              </Button>
            </div>
          </Form.Item>
          <Form.Item label="房间" >
              <div className={styles.roomList}>{house.rooms.map((room, i) => (<Form.Item key={'r_'+i}>
                <div style={{
                  display: 'flex',
                  rowGap: 16,
                  flexDirection: 'column',
                  maxWidth: 400,
                  minWidth:400
                }}
                     className={styles.roomContainer}
                >
                  <Card
                      size="small"
                      title={`${room.name ? room.name : (`房间${i + 1}`)}`}
                      key={`r_${i}`}
                      extra={
                        <CloseOutlined
                            onClick={() => {
                              house.rooms.splice(i, 1);
                              setHouse({ ...house });
                            }}
                        />
                      }
                  >
                    <Form.Item label="名字">
                      <Input
                          value={room.name} onChange={e => {
                        room.name = e.target.value;
                        setHouse({ ...house });
                      }}
                      />
                    </Form.Item>

                    {/* Nest Form.List */}
                    <Form.Item label="瓷砖">
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: 16,
                      }}
                      >
                        {room.blocks.map((block, j) => (<Space key={`b${j}`}>
                              <Form.Item noStyle>
                                <InputNumber addonBefore="宽"
                                             value={block.width} placeholder="宽" onChange={e => {
                                  block.width = e;
                                  setHouse({ ...house });
                                }}
                                />
                              </Form.Item>
                              <Form.Item noStyle>
                                <InputNumber addonBefore="高"
                                             value={block.height} placeholder="高" onChange={e => {
                                  block.height = e;
                                  setHouse({ ...house });
                                }}
                                />
                              </Form.Item>
                              <Form.Item noStyle>
                                <InputNumber
                                    addonAfter="片"
                                    value={block.count} placeholder="片数" onChange={e => {
                                  block.count = e;
                                  setHouse({ ...house });
                                }}
                                />
                              </Form.Item>
                              <CloseOutlined
                                  onClick={() => {
                                    room.blocks.splice(j, 1);
                                    setHouse({ ...house });
                                  }}
                              />
                            </Space>),
                        )}
                        <Button
                            type="dashed" onClick={() => {
                          room.blocks.push({});
                          setHouse({ ...house });
                        }} block
                        >
                          + 添加瓷砖
                        </Button>
                      </div>

                    </Form.Item>
                  </Card>


                </div>
              </Form.Item>))}</div>
          </Form.Item>
          <Form.Item>
            <div style={{
              display: 'flex',
              rowGap: 16,
              flexDirection: 'column',
            }}
            >
              <Button type="primary" onClick={startCalc}>计算</Button>
            </div>

          </Form.Item>
          {/* <Form.Item noStyle shouldUpdate hidden> */}
          {/*     {() => { */}
          {/*         return ( */}
          {/*             <Typography> */}
          {/*                 <pre>{JSON.stringify(house, null, 2)}</pre> */}
          {/*             </Typography> */}
          {/*         ) */}
          {/*     }} */}
          {/* </Form.Item> */}
          {result.count > 0 && <>
            <Form.Item noStyle>
              <Alert
                  message="计算结果"
                  description={<div>
                    总面积为:<b>{result.area / 1000 / 1000}</b>平方米,理论上需要<b>{result.count}</b>块砖，实际有<b>{result.subTotal}</b>块
                    <Divider variant="dashed" style={{ borderColor: '#7cb305' }} dashed>
                      系统优化后共
                    </Divider>
                    <b>{splitResultList.length}</b>块
                  </div>}
                  type="info"
              />
            </Form.Item>
            <Form.Item label="显示尺寸">
              <Slider min={0} max={100} value={size}  onChange={e => setSize(e)} />
            </Form.Item>
          </>}
        </Form>
        {result.count > 0 && <Flex wrap gap="small">
          {splitResultList.map((s, i) => (
              <div
                  key={i}
                  className={styles.roomBlock}
                  style={{
                    '--height': buildSize(s.block.height),
                    '--width': buildSize(s.block.width),
                  }}
              >
                {s.subList.map((b, j) => (<div
                    className={styles.blockSub}
                    key={'bi'+j}
                    style={{
                      '--height': buildSize(b.height),
                      '--width': buildSize(b.width),
                      '--real-width': b.width,
                      '--x': buildSize(b.x),
                      '--y': buildSize(b.y),
                    }}
                >
                  <div className={styles.blockText} style={{ '--rotate': (b.width * 1.5 < b.height ? 1 : 0) }}>
                    <b>{b.name} {b.width}*{b.height} </b>
                  </div>
                </div>))}
              </div>
          ))}
        </Flex>}
      </PageContainer>
  );
}





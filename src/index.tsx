import { definePageConfig } from 'ice';
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

interface BlockPos extends Block {
    x: number;
    y: number;
}

interface BlockSplit {
    block: Block;
    subList: Array<BlockPos>;
}

const RoomBlockIndex: React.FC = () => {
    const defaultBolck: Block = {
        width: 750,
        height: 1500,
    };
    const [block, setBlock] = useState<Block>({
        ...defaultBolck,
    });
    const [result, setResult] = useState({
        area: 0,
        count: 0,
        subTotal: 0,
    });
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


    function findPos(m: BlockSplit, b: Block) {
        let area = 0;
        let w = 0;
        for (let i = 0; i < m.subList.length; i++) {
            const sb = m.subList[i];
            area += sb.width * sb.height;
            w += sb.width;
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
        const blockList: Block[] = [];
        for (let i = 0; i < house.rooms.length; i++) {
            let room = house.rooms[i];
            for (let j = 0; j < room.blocks.length; j++) {
                let sbuBlock = room.blocks[j];
                area += sbuBlock.width * sbuBlock.height * sbuBlock.count;
                for (let k = 0; k < sbuBlock.count; k++) {
                    blockList.push({
                        width: sbuBlock.width,
                        height: sbuBlock.height,
                    });
                }
            }
        }
        const blockResult = [];
        let newBlock = {
            block: block,
            sub: [],
        };
        const sameList: Block[] = [];
        const sameWidthList: Block[] = [];
        const sameHeightList: Block[] = [];
        const otherList: Block[] = [];
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
                    width: sameList[i].width,
                    height: sameList[i].height,
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
                }
                if (b.height + h < m.block.height) {
                    m.subList.push({
                        width: b.width,
                        height: b.height,
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
                    width: b.width,
                    height: b.height,
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
                }
                if (b.width + w < m.block.width) {
                    m.subList.push({
                        width: b.width,
                        height: b.height,
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
                    width: b.width,
                    height: b.height,
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
                const pos = findPos(m, b);
                if (pos != null) {
                    m.subList.push({
                        width: b.width,
                        height: b.height,
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
                    width: b.width,
                    height: b.height,
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
            <Form layout="inline">
              <Form.Item label="宽">
                <InputNumber
                  type="nb"
                  value={block.width}
                  onChange={(e) => {
                                block.width = e;
                                setBlock({ ...block });
                            }}
                />
              </Form.Item>
              <Form.Item label="高">
                <InputNumber
                  value={block.height}
                  onChange={(e) => {
                                block.height = e;
                                setBlock({ ...block });
                            }}
                />
              </Form.Item>
            </Form>
          </Form.Item>
          <Form.Item label="房间">
            <Form
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              name="dynamic_form_complex"
              style={{ maxWidth: 600 }}
              autoComplete="off"
            >
              {house.rooms.map((room, i) => (<Form.Item>
                <div style={{
                                display: 'flex',
                                rowGap: 16,
                                flexDirection: 'column',
                            }}
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
                                <InputNumber
                                    value={block.width} placeholder="宽" onChange={e => {
                                                            block.width = e;
                                                            setHouse({ ...house });
                                                        }}
                                  />
                              </Form.Item>
                            <Form.Item noStyle>
                                <InputNumber
                                    value={block.height} placeholder="高" onChange={e => {
                                                            block.height = e;
                                                            setHouse({ ...house });
                                                        }}
                                  />
                              </Form.Item>
                            <Form.Item noStyle>
                                <InputNumber
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
              </Form.Item>))}
              <Form.Item>
                <div style={{
                                display: 'flex',
                                rowGap: 16,
                                flexDirection: 'column',
                            }}
                >
                  <Button
                    type="dashed"
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
            </Form>
          </Form.Item>
          <Form.Item>
            <Space.Compact>
              <Button type="primary" onClick={startCalc}>计算</Button>
            </Space.Compact>
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
              <Slider value={size} onChange={e => setSize(e)} />
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
                  style={{
                            '--height': buildSize(b.height),
                            '--width': buildSize(b.width),
                            '--x': buildSize(b.x),
                            '--y': buildSize(b.y),
                        }}
                >
                  <div className={styles.blockText} style={{ '--rotate': (b.width * 3 < b.height ? 1 : 0) }}>
                    <b>{b.width}*{b.height}</b></div>
                </div>))}
              </div>
                ))}
        </Flex>}
      </PageContainer>
    );
};

export default RoomBlockIndex;
export const pageConfig = definePageConfig(() => {
    return {
        auth: false,
    };
});

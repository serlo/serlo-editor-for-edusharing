import { useContext } from 'react'
import { EditorEdusharingAssetDocument } from '../types/editor-plugins'
import { EdusharingAssetRenderer } from './renderer'
import { LtikContext } from '../../context/ltikContext'

export function EdusharingAssetStaticRenderer(
  props: EditorEdusharingAssetDocument,
) {
  const nodeId = props.state.edusharingAsset?.nodeId
  const repositoryId = props.state.edusharingAsset?.repositoryId

  const { contentWidth: widthInPercent } = props.state

  const ltik = useContext(LtikContext)

  return (
    <EdusharingAssetRenderer
      nodeId={nodeId}
      repositoryId={repositoryId}
      contentWidth={widthInPercent}
      ltik={ltik}
    />
  )
}
